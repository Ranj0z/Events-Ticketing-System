import { eq } from "drizzle-orm";
import db from "../../Drizzle/db";
import { EventsTable, TIEvents, VenuesTable } from "../../Drizzle/schema";



//Event Table
//Create a new Event
export const createEventService = async(newEvent :TIEvents) => {
    await db.insert(EventsTable).values(newEvent);

    return "Event created successfully";
}

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
export const getEventByVenueIDService = async (VenueID: number) => {
  const EventByVenueID = await db.query.EventsTable.findFirst({
    where: eq(EventsTable.VenueID, VenueID)
  });
  return EventByVenueID;
};


//update a Event by id
export const updateEventService = async (EventID: number, eventsTable: Partial<TIEvents>) => {
    const [updated] = await db.update(EventsTable)
        .set(EventsTable)
        .where(eq(EventsTable.EventID, EventID))
        .returning();
    
    if (updated) {
        return "Event updated successfully ✅";
    }
    return "Event not updated"
}

// Delete Event By ID
export const deleteEventService = async (EventID: number) =>{
    const deletedEvent = await db.delete(EventsTable)
    .where(eq(EventsTable.EventID, EventID))
    .returning();

    if(deletedEvent.length >0){
        return "Event deleted Successfully!!"
    }

    return "Event deleting failed";
}

