import { eq } from "drizzle-orm";
import db from "../../Drizzle/db";
import { TIVenues, VenuesTable } from "../../Drizzle/schema";




//Venue Table
//Create a new Venue
export const createVenueService = async (newVenue: TIVenues) => {
  const [createdVenue] = await db
    .insert(VenuesTable)
    .values(newVenue)
    .returning(); // returns inserted row(s) including serial VenueID

  return createdVenue;
};

//Get All Venues from VenuesTable
export const getAllVenuesService = async () =>{
    const allVenues = await db.query.VenuesTable.findMany()
    return allVenues;
}


// Get Venue By ID
export const getVenueByIDService = async (VenueID: number) => {
  const VenueByID = await db.query.VenuesTable.findFirst({
    where: eq(VenuesTable.VenueID, VenueID)
  });
  return VenueByID;
};



//update a Venue by id
export const updateVenueService = async (venueId: number, venuesTable: Partial<TIVenues>) => {
    const [updated] = await db.update(VenuesTable)
        .set(venuesTable)
        .where(eq(VenuesTable.VenueID, venueId))
        .returning();  
    return updated;
}

// Delete Venue By ID
export const deleteVenueService = async (VenueID: number) =>{
    const deletedVenue = await db.delete(VenuesTable)
    .where(eq(VenuesTable.VenueID, VenueID))
    .returning();
   return deletedVenue;
}

