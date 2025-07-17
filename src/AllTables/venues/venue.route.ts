//routing
import { Express } from "express";
import { createVenueController, deleteVenueController, getAllVenueController, getVenueByIdController, updateVenueController } from "./venue.controller";

 /**
 * venue + Venue full‑stack integration tests
 *
 * Assumes these routes exist (per venueRoutes):
 *   POST   /venue/newVenue              – create venue
 *   GET    /venue/allVenues             – list Venues
 *   GET    /venue/:id                   – get by venueId
 *   PUT    /venue/update/:id            – update by venueId
 *   DELETE /venue/delete/:id            – delete by venueId
 */

//CRUD
const VenueRoutes = (app: Express) => {
    //route
    //Add new Venue
    app.route("/venue/newVenue").post(
        async (req, res, next) =>{
            try {
                await createVenueController(req, res);
            } catch (error: any) {
                next(error)
            }
        }
    )

    //get all Venues
    app.route("/venue/allVenues").get(
        async (req, res, next) =>{
            try {
                await getAllVenueController(req, res);
            } catch (error: any) {
                next(error)
            }
        }
    )

    //get Venue by ID
    app.route("/venue/:id").get(
        async (req, res, next) =>{
            try {
                await getVenueByIdController(req, res);
            } catch (error: any) {
                next(error)
            }
        }
    )

    //update Venue by id
    app.route("/venue/update/:id").patch(
        async (req, res, next) => {
            try {
                await updateVenueController(req, res);
            } catch (error) {
                next(error);
            }
        }
    );    

    //Delete Venue by ID
    app.route("/Venue/delete/:id").delete(
        async (req, res, next) =>{
            try {
                await deleteVenueController(req, res);
            } catch (error: any) {
                next(error)
            }
        }
    )    
}

export default VenueRoutes;