import { and, eq, sql } from "drizzle-orm";
import crypto from "crypto";
import db from "../../Drizzle/db";
import { EventsTable, PaymentTable, RSVPTable } from "../../Drizzle/schema";
import { normalizePhoneNumber } from "../../utils/normalizePhoneNumber";
import { initiateGatewayStkPush } from "../../lib/paybillGateway";
import { markReservationPaidService, releaseTicketTypeCapacity } from "../rsvp/reservation.service";

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
    await db
      .update(PaymentTable)
      .set({ paymentStatus: "Failed", gatewayReference: null })
      .where(eq(PaymentTable.PaymentID, paymentId));
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

export const sweepExpiredHoldsService = async () => {
  const expired = await db.query.RSVPTable.findMany({
    where: and(
      eq(RSVPTable.RSVPStatus, "Pending"),
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

    const rsvps = await db.query.RSVPTable.findMany({ where: eq(RSVPTable.PaymentID, payment.PaymentID) });
    for (const r of rsvps) {
      await markReservationPaidService(r.RSVPID);
    }
  } else {
    await releasePaymentBatch(payment);
  }
};