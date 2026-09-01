import { eq, and, inArray } from "drizzle-orm";
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

// Get payment By RSVPID
export const getPaymentByRSVPIDService = async (ID: number) => {
  return db.query.PaymentTable.findFirst({ where: eq(PaymentTable.RSVPID, ID) });
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
export class RsvpNotFoundError extends Error {}

// Starts a payment: creates the Pending row, calls the gateway, stores the
// CheckoutRequestID (returned synchronously) on the same row.
export const initiatePaymentService = async ({
  rsvpId,
  phoneNumber,
}: {
  rsvpId: number;
  phoneNumber: string;
}) => {
  const rsvp = await db.query.RSVPTable.findFirst({ where: eq(RSVPTable.RSVPID, rsvpId) });
  if (!rsvp) throw new RsvpNotFoundError();

  const existing = await db.query.PaymentTable.findFirst({
    where: and(eq(PaymentTable.RSVPID, rsvpId), inArray(PaymentTable.paymentStatus, ["Pending", "Completed"])),
  });
  if (existing) throw new PaymentAlreadyInitiatedError();

  const amount = Number(rsvp.totalAmount);

  const [payment] = await db
    .insert(PaymentTable)
    .values({
      RSVPID: rsvpId,
      EventID: rsvp.EventID,
      amount: String(amount),
      paymentStatus: "Pending",
    })
    .returning();

  try {
    const { CheckoutRequestID } = await initiateGatewayStkPush({
      phone: normalizePhoneNumber(phoneNumber),
      amount,
      orderRef: String(rsvpId),
    });

    await db
      .update(PaymentTable)
      .set({ gatewayReference: CheckoutRequestID })
      .where(eq(PaymentTable.PaymentID, payment.PaymentID));

    return { paymentId: payment.PaymentID };
  } catch (error) {
    // Gateway call failed synchronously (not retried by the gateway) — don't
    // leave an orphaned Pending row with no gatewayReference; it would block
    // the idempotency check above on every retry.
    await db
      .update(PaymentTable)
      .set({ paymentStatus: "Failed" })
      .where(eq(PaymentTable.PaymentID, payment.PaymentID));
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

    await markReservationPaidService(payment.RSVPID);
  } else {
    await db
      .update(PaymentTable)
      .set({ paymentStatus: "Failed", updated_at: new Date().toISOString() })
      .where(eq(PaymentTable.PaymentID, payment.PaymentID));
  }
};
