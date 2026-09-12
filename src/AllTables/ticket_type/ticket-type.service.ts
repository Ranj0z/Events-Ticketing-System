import { eq } from "drizzle-orm";
import db from "../../Drizzle/db";
import { TicketTypeTable } from "../../Drizzle/schema";

// Get all Ticket Type tiers for a given Event
// Used both for displaying an event's tiers and for RSVP cart-building.
export const getTicketTypesByEventIdService = async (EventID: number) => {
  const ticketTypes = await db.query.TicketTypeTable.findMany({
    where: eq(TicketTypeTable.EventID, EventID),
  });
  return ticketTypes;
};
