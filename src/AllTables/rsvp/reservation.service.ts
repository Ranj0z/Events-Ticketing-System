import { eq } from "drizzle-orm";
import db from "../../Drizzle/db";
import { RSVPTable, TIRSVP } from "../../Drizzle/schema";



//Reservation Table
//Create a new reservation
export const createReservationService = async(newreservation :TIRSVP) => {
    await db.insert(RSVPTable).values(newreservation);

    return "Reservation created successfully";
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
  return reservationByEventID;
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
    
    if (updated) {
        return "RSVP updated successfully ✅";
    }
    return "RSVP not updated"
}

// Delete Reservation By ID
export const deleteReservationService = async (ID: number) =>{
    const deletedReservation = await db.delete(RSVPTable)
    .where(eq(RSVPTable.RSVPID, ID))
    .returning();

    if(deletedReservation.length >0){
        return "Reservation deleted Successfully!!"
    }

    return "Reservation not deleted!!";
}