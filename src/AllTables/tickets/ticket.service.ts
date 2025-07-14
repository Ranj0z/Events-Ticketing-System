import { eq } from "drizzle-orm";
import db from "../../Drizzle/db";
import { TIUserSupportTickets, UserSupportTicketsTable } from "../../Drizzle/schema";


//Ticket Table
//Create a new Ticket
export const createTicketService = async(newTicket :TIUserSupportTickets) => {
    await db.insert(UserSupportTicketsTable).values(newTicket);

    return "Ticket created successfully";
}

//Get All Tickets from UserSupportTicketsTable
export const getAllTicketsService = async () =>{
    const allTickets = await db.query.UserSupportTicketsTable.findMany()
    return allTickets;
}


// Get Ticket By ID
export const getTicketByIDService = async (TicketID: number) => {
  const TicketByID = await db.query.UserSupportTicketsTable.findFirst({
    where: eq(UserSupportTicketsTable.TicketID, TicketID)
  });
  return TicketByID;
};

// Get Ticket By User ID
export const getTicketByUserIDService = async (UserID: number) => {
  const TicketByUserID = await db.query.UserSupportTicketsTable.findFirst({
    where: eq(UserSupportTicketsTable.UserID, UserID)
  });
  return TicketByUserID;
};



//update a Ticket by id
export const updateTicketService = async (TicketID: number, userSupportTicketsTable: Partial<TIUserSupportTickets>) => {
    const [updated] = await db.update(UserSupportTicketsTable)
        .set(UserSupportTicketsTable)
        .where(eq(UserSupportTicketsTable.TicketID, TicketID))
        .returning();
    
    if (updated) {
        return "Ticket updated successfully ✅";
    }
    return "Ticket not updated"
}

// Delete Ticket By ID
export const deleteTicketService = async (TicketID: number) =>{
    const deletedTicket = await db.delete(UserSupportTicketsTable)
    .where(eq(UserSupportTicketsTable.TicketID, TicketID))
    .returning();

    if(deletedTicket.length >0){
        return "Ticket deleted Successfully!!"
    }

    return "Ticket deleting failed";
}

