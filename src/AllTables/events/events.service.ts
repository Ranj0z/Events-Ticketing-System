import { eq, inArray } from "drizzle-orm";
import db from "../../Drizzle/db";
import { EventsTable, RSVPTable, TIEvents, VenuesTable } from "../../Drizzle/schema";
import { deleteImageService } from "../uploads/upload.service";



//Event Table
// events.service.ts
export const createEventService = async (newEvent: TIEvents) => {
  const [created] = await db
  .insert(EventsTable)
  .values(newEvent)
  .returning();
  return created;                 // now you have EventID, VenueID, etc.
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