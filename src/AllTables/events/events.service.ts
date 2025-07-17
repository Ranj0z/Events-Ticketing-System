import { eq } from "drizzle-orm";
import db from "../../Drizzle/db";
import { EventsTable, TIEvents, VenuesTable } from "../../Drizzle/schema";



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


//update a Event by id
export const updateEventService = async (eventID: number, eventsTable: Partial<TIEvents>) => {
    const [updated] = await db.update(EventsTable)
        .set(eventsTable)
        .where(eq(EventsTable.EventID, eventID))
        .returning();

    return updated;
  
}

// Delete Event By ID
export const deleteEventService = async (EventID: number) =>{
    const deletedEvent = await db.delete(EventsTable)
    .where(eq(EventsTable.EventID, EventID))
    .returning();

  return deletedEvent;
}

