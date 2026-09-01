//routing
import { Express } from "express";
import { createEventController, deleteEventController, getAllEventController, getEventByIdController, getEventByUserIdController, getEventByVenueIdController, updateEventController } from "./events.controller";


//CRUD
const EventRoutes = (app: Express) => {
    //route
    //Add new Event
    app.route("/event/newevent").post(
        async (req, res, next) =>{
            try {
                await createEventController(req, res);
            } catch (error: any) {
                next(error)
            }
        }
    )

    //get all Events
    app.route("/event/allevents").get(
        async (req, res, next) =>{
            try {
                await getAllEventController(req, res);
            } catch (error: any) {
                next(error)
            }
        }
    )

    //get Event by ID
    app.route("/event/:id").get(
        async (req, res, next) =>{
            try {
                await getEventByIdController(req, res);
            } catch (error: any) {
                next(error)
            }
        }
    )

    //get Event by Venue ID
    app.route("/event/venue/:id").get(
        async (req, res, next) =>{
            try {
                await getEventByVenueIdController(req, res);
            } catch (error: any) {
                next(error)
            }
        }
    )

    //get Event by User ID
    app.route("/event/user/:id").get(
        async (req, res, next) =>{
            try {
                await getEventByUserIdController(req, res);
            } catch (error: any) {
                next(error)
            }
        }
    )
    
    //update Event by id
    app.route("/event/update/:id").patch(
        async (req, res, next) => {
            try {
                await updateEventController(req, res);
            } catch (error) {
                next(error);
            }
        }
    );    

    //Delete Event by ID
    app.route("/event/delete/:id").delete(
        async (req, res, next) =>{
            try {
                await deleteEventController(req, res);
            } catch (error: any) {
                next(error)
            }
        }
    )    
}

export default EventRoutes;