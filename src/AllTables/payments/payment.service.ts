import { eq } from "drizzle-orm";
import crypto from "crypto";
import db from "../../Drizzle/db";
import { PaymentTable, RSVPTable } from "../../Drizzle/schema";
import { normalizePhoneNumber } from "../../utils/normalizePhoneNumber";
import { initiateGatewayStkPush } from "../../lib/paybillGateway";
import { markReservationPaidService } from "../rsvp/reservation.service";

// Maps the internal DB enum to the vocabulary the frontend polling contract
// expects (eventor-payment-spec.md).
const STATUS_MAP = {
  Pending: "pending",
  Completed: "success",
  Failed: "failed",
} as const;

//Get All Existing Payments
export const getAllPaymentsService = async () => {
  return db.query.PaymentTable.findMany();
};

// Get payment By PaymentID
export const getPaymentByIDService = async (ID: number) => {
  return db.query.PaymentTable.findFirst({ where: eq(PaymentTable.PaymentID, ID) });
};

// Get payment By EventID
export const getPaymentByEventIDService = async (ID: number) => {
  return db.query.PaymentTable.findFirst({ where: eq(PaymentTable.EventID, ID) });
};

// Get payment By RSVPID — Payment no longer has a direct RSVPID column
// (a Payment covers many RSVPs), so this hops RSVP -> PaymentID -> Payment.
export const getPaymentByRSVPIDService = async (ID: number) => {
  const rsvp = await db.query.RSVPTable.findFirst({ where: eq(RSVPTable.RSVPID, ID) });
  if (!rsvp?.PaymentID) return null;
  return getPaymentByIDService(rsvp.PaymentID);
};

// Delete Payment By ID
export const deletePaymentService = async (ID: number) => {
  return db.delete(PaymentTable).where(eq(PaymentTable.PaymentID, ID)).returning();
};

// Shaped for the frontend's GET /payments/:paymentId/status contract.
export const getPaymentStatusService = async (paymentId: number) => {
  const payment = await getPaymentByIDService(paymentId);
  if (!payment) return null;
  return { status: STATUS_MAP[payment.paymentStatus ?? "Pending"] };
};

export class PaymentAlreadyInitiatedError extends Error {}
export class PaymentNotFoundError extends Error {}
export class HoldExpiredError extends Error {}

// Starts a payment for an existing Payment row (created upfront by the
// booking service — see reservation.service L4). Keyed by PaymentID, not
// RSVPID, since one Payment can cover many RSVPs from one checkout.
export const initiatePaymentService = async ({
  paymentId,
  phoneNumber,
  userId,
}: {
  paymentId: number;
  phoneNumber: string;
  userId?: number | null;
}) => {
  const payment = await getPaymentByIDService(paymentId);
  if (!payment) throw new PaymentNotFoundError();

  // holdExpiresAt lives on RSVPTable, not Payment — all RSVPs in a batch
  // share the same value (set together at creation), so any one row tells us.
  const rsvp = await db.query.RSVPTable.findFirst({ where: eq(RSVPTable.PaymentID, paymentId) });
  if (rsvp?.holdExpiresAt && new Date(rsvp.holdExpiresAt) < new Date()) {
    throw new HoldExpiredError();
  }

  // Idempotency: a Pending row already exists by the time /initiate is
  // called (created in L4), so "Pending" alone doesn't mean "not yet
  // initiated". gatewayReference is only set once the gateway call actually
  // fires, so that's the true in-flight signal.
  if (payment.paymentStatus === "Completed") {
    throw new PaymentAlreadyInitiatedError();
  }
  if (payment.paymentStatus === "Pending" && payment.gatewayReference) {
    throw new PaymentAlreadyInitiatedError();
  }
  // paymentStatus === "Failed" falls through and retries below.

  const amount = Number(payment.amount);

  await db
    .update(PaymentTable)
    .set({ UserID: userId ?? null, phoneNumber, paymentStatus: "Pending" })
    .where(eq(PaymentTable.PaymentID, paymentId));

  try {
    const { CheckoutRequestID } = await initiateGatewayStkPush({
      phone: normalizePhoneNumber(phoneNumber),
      amount,
      orderRef: String(paymentId),
    });

    await db
      .update(PaymentTable)
      .set({ gatewayReference: CheckoutRequestID })
      .where(eq(PaymentTable.PaymentID, paymentId));

    return { paymentId };
  } catch (error) {
    // Gateway call failed synchronously (not retried by the gateway) — don't
    // leave a Pending row with a stale/no gatewayReference; it would block
    // retries against the idempotency check above.
    await db
      .update(PaymentTable)
      .set({ paymentStatus: "Failed", gatewayReference: null })
      .where(eq(PaymentTable.PaymentID, paymentId));
    throw error;
  }
};

// Verifies the gateway's webhook signature over the RAW body — whitespace
// differences from re-serializing JSON would break the comparison.
export const verifyGatewaySignature = (rawBody: Buffer, signature: string | undefined) => {
  if (!signature) return false;
  const expected = crypto
    .createHmac("sha256", process.env.GATEWAY_WEBHOOK_SECRET!)
    .update(rawBody)
    .digest("hex");
  return expected === signature;
};

export const handleGatewayWebhookService = async (payload: {
  CheckoutRequestID: string;
  status: "success" | "failed";
  mpesaReceipt: string | null;
}) => {
  const payment = await db.query.PaymentTable.findFirst({
    where: eq(PaymentTable.gatewayReference, payload.CheckoutRequestID),
  });
  if (!payment) return;

  // Gateway retries delivery on non-2xx/timeout — if we've already resolved
  // this payment, don't reprocess (e.g. don't mark the RSVP paid twice).
  if (payment.paymentStatus !== "Pending") return;

  if (payload.status === "success") {
    await db
      .update(PaymentTable)
      .set({
        paymentStatus: "Completed",
        TransactionID: payload.mpesaReceipt ?? undefined,
        updated_at: new Date().toISOString(),
      })
      .where(eq(PaymentTable.PaymentID, payment.PaymentID));

    // Payment.RSVPID no longer exists — a Payment can cover many RSVPs, so
    // mark every RSVP in the batch paid. (Capacity release on the failure
    // branch below is W2, tracked separately — not covered here.)
    const rsvps = await db.query.RSVPTable.findMany({ where: eq(RSVPTable.PaymentID, payment.PaymentID) });
    for (const r of rsvps) {
      await markReservationPaidService(r.RSVPID);
    }
  } else {
    await db
      .update(PaymentTable)
      .set({ paymentStatus: "Failed", updated_at: new Date().toISOString() })
      .where(eq(PaymentTable.PaymentID, payment.PaymentID));
  }
};