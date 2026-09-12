import { eq, inArray } from "drizzle-orm";
import db from "../../Drizzle/db";
import { EventsTable, RSVPTable, TicketTypeTable, TIEvents, TITicketType, VenuesTable } from "../../Drizzle/schema";
import { deleteImageService } from "../uploads/upload.service";

export type TicketTypeInput = {
  name: string;
  type?: "individual" | "group";
  groupSize?: number | null;
  price: number;
  totalQuantity: number;
  description?: string;
};

export type CreateEventInput = Omit<TIEvents, "ticketsPrice" | "totalTickets"> & {
  ticketTypes: TicketTypeInput[];
};

// Validates one ticketTypes[] row. Returns a reason string if invalid, null if valid.
const validateTicketTypeInput = (t: TicketTypeInput): string | null => {
  if (!t.name || typeof t.name !== "string") return "name is required";

  const kind = t.type ?? "individual";
  if (kind !== "individual" && kind !== "group") return "type must be 'individual' or 'group'";

  if (typeof t.price !== "number" || t.price < 0) return "price must be a number >= 0";
  if (typeof t.totalQuantity !== "number" || t.totalQuantity < 0) return "totalQuantity must be a number >= 0";

  if (kind === "group") {
    if (t.groupSize === undefined || t.groupSize === null || t.groupSize <= 0) {
      return "groupSize is required and must be > 0 for group ticket types";
    }
  } else if (t.groupSize !== undefined && t.groupSize !== null) {
    return "groupSize must not be set for individual ticket types";
  }

  return null;
};

//Event Table
// events.service.ts
// Creates an Event together with its ticket_type tiers in one atomic operation:
// the Event insert is rolled back if the ticket_type insert fails.
// Requires the neon-serverless (Pool/websocket) driver in db.ts — the neon-http
// client does not support db.transaction().
export const createEventService = async (newEvent: CreateEventInput) => {
  const { ticketTypes, ...eventFields } = newEvent;

  if (!ticketTypes || ticketTypes.length === 0) {
    return { error: "no_ticket_types" as const };
  }

  for (let i = 0; i < ticketTypes.length; i++) {
    const reason = validateTicketTypeInput(ticketTypes[i]);
    if (reason) {
      return { error: "invalid_ticket_type" as const, index: i, reason };
    }
  }

  // Server-computed — never trust client-supplied totals.
  const ticketsPrice = Math.min(...ticketTypes.map((t) => t.price)).toFixed(2);
  const totalTickets = ticketTypes.reduce((sum, t) => sum + t.totalQuantity, 0);

  const result = await db.transaction(async (tx) => {
    const [createdEvent] = await tx
      .insert(EventsTable)
      .values({ ...eventFields, ticketsPrice, totalTickets } as TIEvents)
      .returning();

    const ticketTypeValues: TITicketType[] = ticketTypes.map((t) => ({
      EventID: createdEvent.EventID,
      name: t.name,
      type: t.type ?? "individual",
      groupSize: t.groupSize ?? null,
      price: t.price.toFixed(2),
      totalQuantity: t.totalQuantity,
      description: t.description,
    }));

    const createdTicketTypes = await tx
      .insert(TicketTypeTable)
      .values(ticketTypeValues)
      .returning();

    return { event: createdEvent, ticketTypes: createdTicketTypes };
  });

  return result;
};


//Get All Events from EventsTable
export const getAllEventsService = async () =>{
    const allEvents = await db.query.EventsTable.findMany()
    return allEvents;
}


// Get Event By EventID
export const getEventByIDService = async (EventID: number) => {
  const EventByID = await db.query.EventsTable.findFirst({
    where: eq(EventsTable.EventID, EventID)
  });
  return EventByID;
};


// Get Event By VenueID
export const getEventByVenueIDService = async (venueID: number) => {
  const EventByVenueID = await db.query.EventsTable.findFirst({
    where: eq(EventsTable.VenueID, venueID)
  });
  return EventByVenueID;
};


//Get events attended by a user (via their RSVPs) — distinct from
//getEventsByHostIDService below, which is about events a host *organizes*.
export const getEventsAttendedByUserIDService = async (userId: number) => {
  // Step 1: Get RSVPs for this user
  const userRSVPs = await db
    .select({ EventID: RSVPTable.EventID })
    .from(RSVPTable)
    .where(eq(RSVPTable.UserID, userId));

  const eventIDs = userRSVPs.map((rsvp) => rsvp.EventID).filter((id): id is number => !!id);

  if (eventIDs.length === 0) return [];

  // Step 2: Get Events for those EventIDs
  const events = await db
    .select()
    .from(EventsTable)
    .where(inArray(EventsTable.EventID, eventIDs));

  return events;
};

//Get events organized by a host
export const getEventsByHostIDService = async (hostId: number) => {
  const events = await db.query.EventsTable.findMany({
    where: eq(EventsTable.HostID, hostId)
  });
  return events;
};

//update a Event by id
export const updateEventService = async (eventID: number, eventsTable: Partial<TIEvents>) => {
    const replacingImage = eventsTable.image_public_id !== undefined;
    const existing = replacingImage
        ? await db.query.EventsTable.findFirst({
            where: eq(EventsTable.EventID, eventID),
            columns: { image_public_id: true }
        })
        : null;

    const [updated] = await db.update(EventsTable)
        .set(eventsTable)
        .where(eq(EventsTable.EventID, eventID))
        .returning();

    if (replacingImage && existing?.image_public_id && existing.image_public_id !== eventsTable.image_public_id) {
        deleteImageService(existing.image_public_id);
    }

    return updated;
  
}

// Delete Event By ID
export const deleteEventService = async (EventID: number) =>{
    const existing = await db.query.EventsTable.findFirst({
        where: eq(EventsTable.EventID, EventID),
        columns: { image_public_id: true }
    });

    const deletedEvent = await db.delete(EventsTable)
    .where(eq(EventsTable.EventID, EventID))
    .returning();

    if (existing?.image_public_id) {
        deleteImageService(existing.image_public_id);
    }

  return deletedEvent;
}