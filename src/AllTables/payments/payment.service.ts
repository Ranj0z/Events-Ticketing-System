import { and, eq, isNotNull, sql } from "drizzle-orm";
import crypto from "crypto";
import axios from "axios";
import db from "../../Drizzle/db";
import { EventsTable, PaymentTable, RSVPTable, TicketTypeTable } from "../../Drizzle/schema";
import { normalizePhoneNumber } from "../../utils/normalizePhoneNumber";
import { initiateGatewayStkPush } from "../../lib/paybillGateway";
import { markReservationPaidService, releaseTicketTypeCapacity } from "../rsvp/reservation.service";
import { creditWalletService } from "../wallet/wallet.service";
import { sendConfirmationEmailService } from "../../mailer/confirmation-email.service";

const STATUS_MAP = {
  Pending: "pending",
  Completed: "success",
  Failed: "failed",
} as const;

export const getAllPaymentsService = async () => {
  return db.query.PaymentTable.findMany();
};

export const getPaymentByIDService = async (ID: number) => {
  return db.query.PaymentTable.findFirst({ where: eq(PaymentTable.PaymentID, ID) });
};

export const getPaymentByEventIDService = async (ID: number) => {
  return db.query.PaymentTable.findFirst({ where: eq(PaymentTable.EventID, ID) });
};

export const getPaymentByRSVPIDService = async (ID: number) => {
  const rsvp = await db.query.RSVPTable.findFirst({ where: eq(RSVPTable.RSVPID, ID) });
  if (!rsvp?.PaymentID) return null;
  return getPaymentByIDService(rsvp.PaymentID);
};

export const deletePaymentService = async (ID: number) => {
  return db.delete(PaymentTable).where(eq(PaymentTable.PaymentID, ID)).returning();
};

export const getPaymentStatusService = async (paymentId: number) => {
  const payment = await getPaymentByIDService(paymentId);
  if (!payment) return null;
  return { status: STATUS_MAP[payment.paymentStatus ?? "Pending"] };
};

export class PaymentAlreadyInitiatedError extends Error {}
export class PaymentNotFoundError extends Error {}
export class HoldExpiredError extends Error {}
export class RsvpNotFoundError extends Error {}
export class RsvpNotPartialPaymentError extends Error {}
export class RsvpAlreadyFullyPaidError extends Error {}
export class InvalidInstallmentAmountError extends Error {}

export class GatewayRateLimitedError extends Error {
  retryAfterSeconds?: number;

  constructor(retryAfterSeconds?: number) {
    super("Gateway rate limited");
    this.name = "GatewayRateLimitedError";
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

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

  const rsvp = await db.query.RSVPTable.findFirst({ where: eq(RSVPTable.PaymentID, paymentId) });
  if (rsvp?.holdExpiresAt && new Date(rsvp.holdExpiresAt) < new Date()) {
    throw new HoldExpiredError();
  }

  if (payment.paymentStatus === "Completed") {
    throw new PaymentAlreadyInitiatedError();
  }
  if (payment.paymentStatus === "Pending" && payment.gatewayReference) {
    throw new PaymentAlreadyInitiatedError();
  }

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
    // A 429 from the gateway (per-app or per-phone limiter in the Paybill
    // Gateway's stkpush route) is retryable, not a real failure — leave the
    // payment in "Pending" with no gatewayReference so the existing
    // Pending-and-no-gatewayReference check above allows an immediate retry
    // once the window passes, instead of terminally marking it "Failed".
    if (axios.isAxiosError(error) && error.response?.status === 429) {
      const retryAfterHeader = error.response.headers?.["retry-after"];
      const retryAfterSeconds = retryAfterHeader ? Number(retryAfterHeader) : undefined;

      await db
        .update(PaymentTable)
        .set({ gatewayReference: null })
        .where(eq(PaymentTable.PaymentID, paymentId));

      throw new GatewayRateLimitedError(
        Number.isFinite(retryAfterSeconds) ? retryAfterSeconds : undefined
      );
    }

    await db
      .update(PaymentTable)
      .set({ paymentStatus: "Failed", gatewayReference: null })
      .where(eq(PaymentTable.PaymentID, paymentId));
    throw error;
  }
};

// Partial-payments plan §4 — initiate one installment (a single STK push) against
// a specific RSVP. Unlike the batch flow above, no Payment row exists yet when
// this is called; each installment creates its own.
export const initiateInstallmentPaymentService = async ({
  rsvpId,
  phoneNumber,
  amount,
  userId,
}: {
  rsvpId: number;
  phoneNumber: string;
  amount: number;
  userId?: number | null;
}) => {
  const rsvp = await db.query.RSVPTable.findFirst({ where: eq(RSVPTable.RSVPID, rsvpId) });
  if (!rsvp) throw new RsvpNotFoundError();

  const event = await db.query.EventsTable.findFirst({ where: eq(EventsTable.EventID, rsvp.EventID) });
  if (!event?.partialPaymentsEnabled) throw new RsvpNotPartialPaymentError();

  // §6 — only an RSVP with zero payments so far is subject to hold expiry.
  if (Number(rsvp.amountPaid) === 0 && rsvp.holdExpiresAt && new Date(rsvp.holdExpiresAt) < new Date()) {
    throw new HoldExpiredError();
  }

  const remaining = Number(rsvp.totalAmount) - Number(rsvp.amountPaid);
  if (remaining <= 0) throw new RsvpAlreadyFullyPaidError();

  // §4 step 2 — amount >= 100, OR exactly the remaining balance (even if under 100).
  const isExactRemainder = Math.abs(amount - remaining) < 0.005;
  if (!isExactRemainder && (amount < 100 || amount > remaining + 0.005)) {
    throw new InvalidInstallmentAmountError();
  }

  const existingPending = await db.query.PaymentTable.findFirst({
    where: and(
      eq(PaymentTable.rsvpId, rsvpId),
      eq(PaymentTable.paymentStatus, "Pending"),
      isNotNull(PaymentTable.gatewayReference)
    ),
  });
  if (existingPending) throw new PaymentAlreadyInitiatedError();

  const [payment] = await db.insert(PaymentTable).values({
    EventID: rsvp.EventID,
    rsvpId: rsvp.RSVPID,
    UserID: userId ?? null,
    phoneNumber,
    amount: amount.toFixed(2),
    paymentStatus: "Pending",
  }).returning();

  try {
    const { CheckoutRequestID } = await initiateGatewayStkPush({
      phone: normalizePhoneNumber(phoneNumber),
      amount,
      orderRef: String(payment.PaymentID),
    });

    await db
      .update(PaymentTable)
      .set({ gatewayReference: CheckoutRequestID })
      .where(eq(PaymentTable.PaymentID, payment.PaymentID));

    return { paymentId: payment.PaymentID };
  } catch (error) {
    // Same rate-limit handling as the batch flow — retryable, leave Pending
    // with no gatewayReference so a retry is allowed once the window passes.
    if (axios.isAxiosError(error) && error.response?.status === 429) {
      const retryAfterHeader = error.response.headers?.["retry-after"];
      const retryAfterSeconds = retryAfterHeader ? Number(retryAfterHeader) : undefined;
      throw new GatewayRateLimitedError(
        Number.isFinite(retryAfterSeconds) ? retryAfterSeconds : undefined
      );
    }

    await db
      .update(PaymentTable)
      .set({ paymentStatus: "Failed" })
      .where(eq(PaymentTable.PaymentID, payment.PaymentID));
    throw error;
  }
};

export const verifyGatewaySignature = (rawBody: Buffer, signature: string | undefined) => {
  if (!signature) return false;
  const expected = crypto
    .createHmac("sha256", process.env.GATEWAY_WEBHOOK_SECRET!)
    .update(rawBody)
    .digest("hex");
  return expected === signature;
};

const releasePaymentBatch = async (payment: { PaymentID: number; EventID: number }) => {
  const rsvps = await db.query.RSVPTable.findMany({ where: eq(RSVPTable.PaymentID, payment.PaymentID) });

  const countByTicketType = new Map<number, number>();
  for (const r of rsvps) {
    countByTicketType.set(r.TicketTypeID, (countByTicketType.get(r.TicketTypeID) ?? 0) + 1);
  }
  await releaseTicketTypeCapacity(
    [...countByTicketType].map(([TicketTypeID, quantity]) => ({ TicketTypeID, quantity }))
  );
  await db
    .update(EventsTable)
    .set({ soldTickets: sql`${EventsTable.soldTickets} - ${rsvps.length}` })
    .where(eq(EventsTable.EventID, payment.EventID));

  await db
    .update(RSVPTable)
    .set({ RSVPStatus: "Cancelled" })
    .where(eq(RSVPTable.PaymentID, payment.PaymentID));

  await db
    .update(PaymentTable)
    .set({ paymentStatus: "Failed", updated_at: new Date().toISOString() })
    .where(eq(PaymentTable.PaymentID, payment.PaymentID));

  return rsvps.length;
};

// Partial-payments plan §4 step 5 / §6 — fail any still-Pending installment
// Payment row(s) for this RSVP. Used both on webhook failure and on sweep.
const failPendingInstallmentPayments = async (rsvpId: number) => {
  await db
    .update(PaymentTable)
    .set({ paymentStatus: "Failed", updated_at: new Date().toISOString() })
    .where(and(eq(PaymentTable.rsvpId, rsvpId), eq(PaymentTable.paymentStatus, "Pending")));
};

// Cancel a single partial-payment RSVP and release its one seat of capacity.
// Only ever called for an RSVP with amountPaid = 0 (plan §4 step 5 / §6) — a
// partially-paid RSVP is never swept or cancelled on a later failed installment.
const releaseSingleRsvpHold = async (rsvp: { RSVPID: number; EventID: number; TicketTypeID: number }) => {
  await releaseTicketTypeCapacity([{ TicketTypeID: rsvp.TicketTypeID, quantity: 1 }]);
  await db
    .update(EventsTable)
    .set({ soldTickets: sql`${EventsTable.soldTickets} - 1` })
    .where(eq(EventsTable.EventID, rsvp.EventID));
  await db
    .update(RSVPTable)
    .set({ RSVPStatus: "Cancelled" })
    .where(eq(RSVPTable.RSVPID, rsvp.RSVPID));
};

export const sweepExpiredHoldsService = async () => {
  // Batch-cart flow (unchanged), now also guarded on amountPaid = 0 per plan §6
  // (always true for this flow in practice — batch RSVPs never touch amountPaid).
  const expired = await db.query.RSVPTable.findMany({
    where: and(
      eq(RSVPTable.RSVPStatus, "Pending"),
      eq(RSVPTable.amountPaid, "0"),
      sql`${RSVPTable.holdExpiresAt} IS NOT NULL AND ${RSVPTable.holdExpiresAt} < now()`
    ),
  });

  const paymentIDs = [...new Set(expired.map((r) => r.PaymentID).filter((id): id is number => id !== null))];

  let releasedBatches = 0;
  let releasedRSVPs = 0;
  for (const PaymentID of paymentIDs) {
    const payment = await db.query.PaymentTable.findFirst({ where: eq(PaymentTable.PaymentID, PaymentID) });
    if (!payment || payment.paymentStatus !== "Pending") continue;

    releasedRSVPs += await releasePaymentBatch(payment);
    releasedBatches += 1;
  }

  // Partial-payments plan §6 — RSVPs with no batch Payment at all (partial-payment
  // events) that never received a single successful installment before their hold
  // expired. Swept individually since each is its own seat, not a shared batch.
  const expiredPartial = expired.filter((r) => r.PaymentID === null);
  for (const rsvp of expiredPartial) {
    await failPendingInstallmentPayments(rsvp.RSVPID);
    await releaseSingleRsvpHold(rsvp);
    releasedRSVPs += 1;
  }

  return { releasedBatches, releasedRSVPs };
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

    // Credit the host's wallet with this payment's amount (the full sale for the
    // batch flow, or just this installment's amount for the partial-payments
    // flow). creditWalletService is idempotent on PaymentID, so a webhook
    // redelivery for an already-credited payment is a safe no-op.
    const event = await db.query.EventsTable.findFirst({ where: eq(EventsTable.EventID, payment.EventID) });
    if (event) {
      await creditWalletService({
        hostUserId: event.HostID,
        paymentId: payment.PaymentID,
        amount: payment.amount,
      });
    }

    if (payment.rsvpId) {
      // Partial-payments plan §4 step 4 — credit this installment toward the RSVP,
      // and only flip to Booked/paid once the running total covers totalAmount.
      const rsvp = await db.query.RSVPTable.findFirst({ where: eq(RSVPTable.RSVPID, payment.rsvpId) });
      if (rsvp) {
        const newAmountPaid = Number(rsvp.amountPaid) + Number(payment.amount);
        const isFullyPaid = newAmountPaid >= Number(rsvp.totalAmount);

        const [updatedRsvp] = await db
          .update(RSVPTable)
          .set({
            amountPaid: newAmountPaid.toFixed(2),
            ...(isFullyPaid ? { paid: true, RSVPStatus: "Booked" as const } : {}),
          })
          .where(eq(RSVPTable.RSVPID, rsvp.RSVPID))
          .returning();

        // §6 — confirmation email once fully paid, same as the free-ticket path.
        if (isFullyPaid && updatedRsvp && event) {
          const ticketType = await db.query.TicketTypeTable.findFirst({
            where: eq(TicketTypeTable.TicketTypeID, rsvp.TicketTypeID),
          });
          if (ticketType) {
            sendConfirmationEmailService({
              rsvps: [updatedRsvp],
              event,
              ticketTypeById: new Map([[ticketType.TicketTypeID, ticketType]]),
            }).catch(() => {});
          }
        }
      }
    } else {
      const rsvps = await db.query.RSVPTable.findMany({ where: eq(RSVPTable.PaymentID, payment.PaymentID) });
      for (const r of rsvps) {
        await markReservationPaidService(r.RSVPID);
      }
    }
  } else if (payment.rsvpId) {
    // Partial-payments plan §4 step 5 — fail this installment; only cancel the
    // RSVP/release capacity if it never had a single successful installment.
    await failPendingInstallmentPayments(payment.rsvpId);
    const rsvp = await db.query.RSVPTable.findFirst({ where: eq(RSVPTable.RSVPID, payment.rsvpId) });
    if (rsvp && Number(rsvp.amountPaid) === 0 && rsvp.RSVPStatus === "Pending") {
      await releaseSingleRsvpHold(rsvp);
    }
  } else {
    await releasePaymentBatch(payment);
  }
};