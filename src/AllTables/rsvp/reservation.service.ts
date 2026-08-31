import { and, eq, inArray, isNull, sql } from "drizzle-orm";
import db from "../../Drizzle/db";
import { EventsTable, RSVPTable, TIRSVP } from "../../Drizzle/schema";



//Reservation Table
//Create a new reservation
export const createReservationService = async(newreservation :TIRSVP) => {
  // 1. Create RSVP
    const [RSVP] = await db.insert(RSVPTable)
    .values(newreservation)
    .returning();

    if (!RSVP) return null;

    //Fetch the record of sold tickets before rsvp is made
    const prev = await db.query.EventsTable.findFirst({
      where: eq(EventsTable.EventID, newreservation.EventID)
    })
    console.log(`Sold Tickets available ${prev?.soldTickets}`);

   
    //2 Increment soldTickets for the event
    await db.update(EventsTable)
    .set({
      soldTickets: sql`${EventsTable.soldTickets}+1`
    })
    .where(eq(EventsTable.EventID, newreservation.EventID));

  // Fetch the updated soldTickets value
  const updatedEvent = await db.query.EventsTable.findFirst({
    where: eq(EventsTable.EventID, newreservation.EventID),
  });
  console.log(`Updated soldTickets: ${updatedEvent?.soldTickets}`);

    return RSVP;
}

//Get All reservation from RSVP Table
export const getAllReservationsService = async () =>{
    const allReservations = await db.query.RSVPTable.findMany()
    return allReservations;
}


// Get reservation By RSVPID
export const getReservationByRSVPIDService = async (ID: number) => {
  const reservationByID = await db.query.RSVPTable.findFirst({
    where: eq(RSVPTable.RSVPID, ID)
  });
  return reservationByID;
};

// Get reservation By EventID
export const getReservationByEventIDService = async (ID: number) => {
  const reservationByEventID = await db.query.RSVPTable.findMany({
    where: eq(RSVPTable.EventID, ID)
  });
  return [reservationByEventID];
};

// Get reservation By UserID
export const getReservationByUserIDService = async (ID: number) => {
  const reservationByUserID = await db.query.RSVPTable.findMany({
    where: eq(RSVPTable.UserID, ID)
  });
  return reservationByUserID;
};


//update a reservation by id
export const updateReservationService = async (ID: number, rsvpTable: Partial<TIRSVP>) => {
    const [updated] = await db.update(RSVPTable)
        .set(RSVPTable)
        .where(eq(RSVPTable.RSVPID, ID))
        .returning();
    
   return updated;
}

// Delete Reservation By ID
export const deleteReservationService = async (ID: number) =>{
    const deletedReservation = await db.delete(RSVPTable)
    .where(eq(RSVPTable.RSVPID, ID))
    .returning();


    return deletedReservation;
}

// Guest RSVPs matching an email that aren't tied to any account yet —
// used to prompt "link these to your account?" after login/registration
export const getUnlinkedGuestReservationsService = async (email: string) => {
  const guestReservations = await db.query.RSVPTable.findMany({
    where: and(eq(RSVPTable.email, email), isNull(RSVPTable.UserID))
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