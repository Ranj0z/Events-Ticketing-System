import { eq } from "drizzle-orm";
import db from "../../Drizzle/db";
import { TIUserSupportTickets, UserSupportTicketsTable } from "../../Drizzle/schema";


//Ticket Table
//Create a new Ticket
export const createTicketService = async(newTicket :TIUserSupportTickets) => {
    const [Ticket] = await db.insert(UserSupportTicketsTable)
    .values(newTicket)
    .returning();

    return Ticket;
}

//Get All Tickets from UserSupportTicketsTable
export const getAllTicketsService = async () =>{
    const [allTickets] = await db.query.UserSupportTicketsTable.findMany()
    return allTickets;
}


// Get Ticket By ID
export const getTicketByIDService = async (ticketID: number) => {
  const TicketByID = await db.query.UserSupportTicketsTable.findFirst({
    where: eq(UserSupportTicketsTable.TicketID, ticketID)
  });
  return TicketByID;
};

// Get Ticket By User ID
export const getTicketByUserIDService = async (userId: number) => {
  const TicketByUserID = await db.query.UserSupportTicketsTable.findFirst({
    where: eq(UserSupportTicketsTable.UserID, userId)
  });
  return TicketByUserID;
};



//update a Ticket by id
export const updateTicketService = async (ticketId: number, userSupportTicketsTable: Partial<TIUserSupportTickets>) => {
    const [updated] = await db.update(UserSupportTicketsTable)
        .set(userSupportTicketsTable)
        .where(eq(UserSupportTicketsTable.TicketID, ticketId))
        .returning();
    
    return updated;
}

// Delete Ticket By ID
export const deleteTicketService = async (ticketId: number) =>{
    const deletedTicket = await db.delete(UserSupportTicketsTable)
    .where(eq(UserSupportTicketsTable.TicketID, ticketId))
    .returning();

    return deletedTicket;
}

