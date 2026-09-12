import { randomUUID } from "crypto";
import { and, eq, inArray, isNull, sql } from "drizzle-orm";
import db from "../../Drizzle/db";
import { EventsTable, PaymentTable, RSVPTable, TicketTypeTable, TIRSVP } from "../../Drizzle/schema";

// ---- Cart types (multi-ticket-type / single-payment booking) ----
export type CartAttendee = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
};

export type CartLine = {
  TicketTypeID: number;
  quantity: number;
  attendees: CartAttendee[];
};

export type CreateReservationInput = {
  UserID?: number | null;
  cart: CartLine[];
};

// Release previously-reserved TicketType capacity — used on any failure after
// L2 succeeds but before the booking completes. Also reused by payment.service's
// webhook failure branch (W2) to release capacity on a failed payment.
export const releaseTicketTypeCapacity = async (reserved: { TicketTypeID: number; quantity: number }[]) => {
  for (const r of reserved) {
    await db.update(TicketTypeTable)
      .set({ soldQuantity: sql`${TicketTypeTable.soldQuantity} - ${r.quantity}` })
      .where(eq(TicketTypeTable.TicketTypeID, r.TicketTypeID));
  }
};

// Create reservations for a cart that may span multiple ticket types under one event,
// resulting in either no Payment (all-$0 cart) or a single shared Payment row.
//
// No interactive multi-statement transactions here — same Neon HTTP driver constraint
// as the rest of this service — so capacity is reserved via sequential atomic
// UPDATE...WHERE...RETURNING calls, with manual rollback (release) on any later failure.
export const createReservationService = async ({ UserID, cart }: CreateReservationInput) => {
  // Resolve ticket types up front: confirms they exist, gives us price + EventID.
  const ticketTypeIDs = cart.map((line) => line.TicketTypeID);
  const ticketTypes = await db.query.TicketTypeTable.findMany({
    where: inArray(TicketTypeTable.TicketTypeID, ticketTypeIDs),
  });
  const ticketTypeById = new Map(ticketTypes.map((t) => [t.TicketTypeID, t]));

  for (const line of cart) {
    if (!ticketTypeById.has(line.TicketTypeID)) {
      return { error: "ticket_type_not_found" as const, TicketTypeID: line.TicketTypeID };
    }
  }

  const eventIDs = new Set(ticketTypes.map((t) => t.EventID));
  if (eventIDs.size !== 1) {
    return { error: "mixed_event_cart" as const };
  }
  const EventID = [...eventIDs][0];

  // L2 — reserve capacity per ticket type, in order, rolling back on the first failure.
  const reserved: { TicketTypeID: number; quantity: number }[] = [];
  for (const line of cart) {
    const [row] = await db.update(TicketTypeTable)
      .set({ soldQuantity: sql`${TicketTypeTable.soldQuantity} + ${line.quantity}` })
      .where(and(
        eq(TicketTypeTable.TicketTypeID, line.TicketTypeID),
        sql`${TicketTypeTable.soldQuantity} + ${line.quantity} <= ${TicketTypeTable.totalQuantity}`
      ))
      .returning();

    if (!row) {
      await releaseTicketTypeCapacity(reserved);
      return { error: "sold_out" as const, TicketTypeID: line.TicketTypeID };
    }
    reserved.push({ TicketTypeID: line.TicketTypeID, quantity: line.quantity });
  }

  // Keep EventsTable.soldTickets in sync with the cart total across all lines.
  const totalQty = cart.reduce((sum, line) => sum + line.quantity, 0);
  const [eventRow] = await db.update(EventsTable)
    .set({ soldTickets: sql`${EventsTable.soldTickets} + ${totalQty}` })
    .where(and(
      eq(EventsTable.EventID, EventID),
      sql`${EventsTable.soldTickets} + ${totalQty} <= ${EventsTable.totalTickets}`
    ))
    .returning();

  if (!eventRow) {
    await releaseTicketTypeCapacity(reserved);
    return { error: "sold_out" as const, EventID };
  }

  // L3 — flatten cart lines into one RSVP row per attendee, each with its own
  // check-in code generated at creation time.
  const rsvpValues = cart.flatMap((line) => {
    const ticketType = ticketTypeById.get(line.TicketTypeID)!;
    return line.attendees.map((attendee) => ({
      UserID: UserID ?? null,
      EventID,
      TicketTypeID: line.TicketTypeID,
      firstName: attendee.firstName,
      lastName: attendee.lastName,
      email: attendee.email,
      phoneNumber: attendee.phoneNumber,
      totalAmount: ticketType.price,
      checkInCode: randomUUID(),
    }));
  });

  const cartTotal = rsvpValues.reduce((sum, r) => sum + Number(r.totalAmount), 0);

  try {
    // L4 — branch on cart total.
    if (cartTotal === 0) {
      const rsvps = await db.insert(RSVPTable).values(
        rsvpValues.map((r) => ({
          ...r,
          RSVPStatus: "Booked" as const,
          paid: false,
          PaymentID: null,
        }))
      ).returning();

      return { rsvps, payment: null };
    }

    const [payment] = await db.insert(PaymentTable).values({
      EventID,
      amount: cartTotal.toFixed(2),
    }).returning();

    const holdExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
    const rsvps = await db.insert(RSVPTable).values(
      rsvpValues.map((r) => ({
        ...r,
        RSVPStatus: "Pending" as const,
        paid: false,
        PaymentID: payment.PaymentID,
        holdExpiresAt,
      }))
    ).returning();

    return { rsvps, payment };
  } catch (err) {
    // L5 — release everything reserved above before surfacing the failure.
    await releaseTicketTypeCapacity(reserved);
    await db.update(EventsTable)
      .set({ soldTickets: sql`${EventsTable.soldTickets} - ${totalQty}` })
      .where(eq(EventsTable.EventID, EventID));
    throw err;
  }
};

//Get All reservation from RSVP Table
export const getAllReservationsService = async () => {
  const allReservations = await db.query.RSVPTable.findMany();
  return allReservations;
};

// Get reservation By RSVPID
export const getReservationByRSVPIDService = async (ID: number) => {
  const reservationByID = await db.query.RSVPTable.findFirst({
    where: eq(RSVPTable.RSVPID, ID),
  });
  return reservationByID;
};

// Get reservation By EventID
export const getReservationByEventIDService = async (ID: number) => {
  const reservationByEventID = await db.query.RSVPTable.findMany({
    where: eq(RSVPTable.EventID, ID),
  });
  return [reservationByEventID];
};

// Get reservation By UserID
export const getReservationByUserIDService = async (ID: number) => {
  const reservationByUserID = await db.query.RSVPTable.findMany({
    where: eq(RSVPTable.UserID, ID),
  });
  return reservationByUserID;
};

//update a reservation by id
export const updateReservationService = async (ID: number, rsvpTable: Partial<TIRSVP>) => {
  const [updated] = await db.update(RSVPTable)
    .set(rsvpTable)
    .where(eq(RSVPTable.RSVPID, ID))
    .returning();

  return updated;
};

// Delete Reservation By ID
export const deleteReservationService = async (ID: number) => {
  const deletedReservation = await db.delete(RSVPTable)
    .where(eq(RSVPTable.RSVPID, ID))
    .returning();

  return deletedReservation;
};

// Guest RSVPs matching an email that aren't tied to any account yet —
// used to prompt "link these to your account?" after login/registration
export const getUnlinkedGuestReservationsService = async (email: string) => {
  const guestReservations = await db.query.RSVPTable.findMany({
    where: and(eq(RSVPTable.email, email), isNull(RSVPTable.UserID)),
  });
  return guestReservations;
};

// Link specific guest RSVPs to an account. Re-checks email + UserID IS NULL
// server-side for every ID — never trusts that the caller's list is honest.
export const linkGuestReservationsService = async (userID: number, email: string, rsvpIDs: number[]) => {
  const linked = await db.update(RSVPTable)
    .set({ UserID: userID })
    .where(and(
      inArray(RSVPTable.RSVPID, rsvpIDs),
      eq(RSVPTable.email, email),
      isNull(RSVPTable.UserID)
    ))
    .returning();
  return linked;
};

// Manually flip an RSVP's paid flag to true — e.g. cash payment recorded
// outside the payment table, or manual reconciliation
export const markReservationPaidService = async (ID: number) => {
  const [updated] = await db.update(RSVPTable)
    .set({ paid: true })
    .where(eq(RSVPTable.RSVPID, ID))
    .returning();
  return updated;
};

// Undo path — flip paid back to false
export const markReservationUnpaidService = async (ID: number) => {
  const [updated] = await db.update(RSVPTable)
    .set({ paid: false })
    .where(eq(RSVPTable.RSVPID, ID))
    .returning();
  return updated;
};