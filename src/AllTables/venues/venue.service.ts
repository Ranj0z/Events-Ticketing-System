import { eq } from "drizzle-orm";
import db from "../../Drizzle/db";
import { TIVenues, VenuesTable } from "../../Drizzle/schema";
import { deleteImageService } from "../uploads/upload.service";




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
    const replacingImage = venuesTable.image_public_id !== undefined;
    const existing = replacingImage
        ? await db.query.VenuesTable.findFirst({
            where: eq(VenuesTable.VenueID, venueId),
            columns: { image_public_id: true }
        })
        : null;

    const [updated] = await db.update(VenuesTable)
        .set(venuesTable)
        .where(eq(VenuesTable.VenueID, venueId))
        .returning();

    if (replacingImage && existing?.image_public_id && existing.image_public_id !== venuesTable.image_public_id) {
        deleteImageService(existing.image_public_id);
    }

    return updated;
}

// Delete Venue By ID
export const deleteVenueService = async (VenueID: number) =>{
    const existing = await db.query.VenuesTable.findFirst({
        where: eq(VenuesTable.VenueID, VenueID),
        columns: { image_public_id: true }
    });

    const deletedVenue = await db.delete(VenuesTable)
    .where(eq(VenuesTable.VenueID, VenueID))
    .returning();

    if (existing?.image_public_id) {
        deleteImageService(existing.image_public_id);
    }

   return deletedVenue;
}