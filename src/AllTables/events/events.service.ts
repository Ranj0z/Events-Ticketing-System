import { eq, inArray, and, ne } from "drizzle-orm";
import db from "../../Drizzle/db";
import { EventsTable, EventSlugHistoryTable, RSVPTable, TicketTypeTable, TIEvents, TITicketType, VenuesTable } from "../../Drizzle/schema";
import { deleteImageService } from "../uploads/upload.service";
import { slugify } from "../../utils/slugify";

export type TicketTypeInput = {
  name: string;
  type?: "individual" | "group";
  groupSize?: number | null;
  price: number;
  totalQuantity: number;
  description?: string;
};

export type CreateEventInput = Omit<TIEvents, "ticketsPrice" | "totalTickets" | "slug"> & {
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

// Validates the category/customCategory pairing. Returns a reason string if invalid,
// null if valid. Does not mutate — caller is responsible for forcing customCategory
// to null when category isn't "Other".
const validateCategoryFields = (
  category: string | null | undefined,
  customCategory: string | null | undefined
): string | null => {
  if (category === "Other") {
    if (!customCategory || typeof customCategory !== "string" || customCategory.trim().length === 0) {
      return "customCategory is required when category is 'Other'";
    }
    if (customCategory.length > 30) {
      return "customCategory must be 30 characters or fewer";
    }
  }
  return null;
};

// Generates a unique slug for an event title. Checks both the live EventsTable.slug
// column and EventSlugHistoryTable — a new/renamed event is never assigned a slug
// that appears in history, even if that old event no longer uses it, so old shared
// links can't be hijacked.
export const generateUniqueSlugService = async (title: string, excludeEventId?: number): Promise<string> => {
  const base = slugify(title);
  let candidate = base;
  let suffix = 2;

  while (true) {
    const [liveMatch, historyMatch] = await Promise.all([
      db.query.EventsTable.findFirst({
        where: excludeEventId
          ? and(eq(EventsTable.slug, candidate), ne(EventsTable.EventID, excludeEventId))
          : eq(EventsTable.slug, candidate),
        columns: { EventID: true },
      }),
      db.query.EventSlugHistoryTable.findFirst({
        where: eq(EventSlugHistoryTable.slug, candidate),
        columns: { id: true },
      }),
    ]);

    if (!liveMatch && !historyMatch) return candidate;

    candidate = `${base}-${suffix}`.slice(0, 60);
    suffix++;
  }
};

// Looks up an event by its current slug. If the slug isn't live, checks slug history
// for a redirect target (the event's current slug). found: false + redirectSlug: null
// means the slug is unknown anywhere → controller 404s.
export const getEventBySlugService = async (slug: string) => {
  const event = await db.query.EventsTable.findFirst({ where: eq(EventsTable.slug, slug) });
  if (event) {
    return { found: true as const, event };
  }

  const historyEntry = await db.query.EventSlugHistoryTable.findFirst({
    where: eq(EventSlugHistoryTable.slug, slug),
  });

  if (!historyEntry) {
    return { found: false as const, redirectSlug: null };
  }

  const currentEvent = await db.query.EventsTable.findFirst({
    where: eq(EventsTable.EventID, historyEntry.EventID),
    columns: { slug: true },
  });

  return { found: false as const, redirectSlug: currentEvent?.slug ?? null };
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

  const categoryError = validateCategoryFields(eventFields.category, eventFields.customCategory);
  if (categoryError) {
    return { error: "invalid_category" as const, reason: categoryError };
  }
  if (eventFields.category !== "Other") {
    eventFields.customCategory = null;
  }

  // Server-computed — never trust client-supplied totals or slug.
  const ticketsPrice = Math.min(...ticketTypes.map((t) => t.price)).toFixed(2);
  const totalTickets = ticketTypes.reduce((sum, t) => sum + t.totalQuantity, 0);
  const slug = await generateUniqueSlugService(eventFields.title);

  const result = await db.transaction(async (tx) => {
    const [createdEvent] = await tx
      .insert(EventsTable)
      .values({ ...eventFields, slug, ticketsPrice, totalTickets } as TIEvents)
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
    // Slug is server-managed (regenerated only when title changes below) — never
    // let a client patch it directly.
    delete (eventsTable as Partial<TIEvents> & { slug?: unknown }).slug;

    // Category/customCategory validation + normalization
    if (eventsTable.category !== undefined || eventsTable.customCategory !== undefined) {
        const effectiveCategory = eventsTable.category !== undefined
            ? eventsTable.category
            : (await db.query.EventsTable.findFirst({
                where: eq(EventsTable.EventID, eventID),
                columns: { category: true }
            }))?.category;

        const categoryError = validateCategoryFields(effectiveCategory, eventsTable.customCategory);
        if (categoryError) {
            return { error: "invalid_category" as const, reason: categoryError };
        }
        if (effectiveCategory !== "Other") {
            eventsTable.customCategory = null;
        }
    }

    const replacingImage = eventsTable.image_public_id !== undefined;
    const titleChanging = eventsTable.title !== undefined;
    const existing = (replacingImage || titleChanging)
        ? await db.query.EventsTable.findFirst({
            where: eq(EventsTable.EventID, eventID),
            columns: { image_public_id: true, title: true, slug: true }
        })
        : null;

    // Title changed → regenerate the slug and archive the old one so old links
    // can still resolve via a redirect. (existing.slug is DB-notNull, but the query
    // builder's inferred type is nullable — the truthy check narrows it for TS.)
    if (titleChanging && existing && existing.slug && eventsTable.title !== existing.title) {
        eventsTable.slug = await generateUniqueSlugService(eventsTable.title as string, eventID);
        await db.insert(EventSlugHistoryTable).values({ slug: existing.slug, EventID: eventID });
    }

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