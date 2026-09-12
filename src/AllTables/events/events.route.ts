//routing
import { Express } from "express";
import { createEventController, deleteEventController, getAllEventController, getEventByIdController, getEventsAttendedByUserIdController, getEventsByHostIdController, getEventByVenueIdController, updateEventController } from "./events.controller";
import { bothHARoleAuth, requireOwnerOrAdmin } from "../../middleware/tokensAuth";
import { getEventByIDService } from "./events.service";

// Phase 2.1: EventsTable now has HostID, so the ownership check deferred in
// Phase 1 is wired in below — a host token can only update/delete an event
// where HostID matches their own user id; admins can touch any event.
const eventOwnerResolver = async (req: any) => {
    const event = await getEventByIDService(parseInt(req.params.id));
    return event?.HostID ?? null;
}

//CRUD
const EventRoutes = (app: Express) => {
    //route
    //Add new Event
    app.route("/event/newevent").post(
        bothHARoleAuth,
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

    //get Event by User ID (events the user has RSVP'd to / attended)
    app.route("/event/user/:id").get(
        async (req, res, next) =>{
            try {
                await getEventsAttendedByUserIdController(req, res);
            } catch (error: any) {
                next(error)
            }
        }
    )

    //get Events by Host ID (events the host organizes)
    app.route("/event/host/:id").get(
        async (req, res, next) =>{
            try {
                await getEventsByHostIdController(req, res);
            } catch (error: any) {
                next(error)
            }
        }
    )
    
    //update Event by id
    app.route("/event/update/:id").patch(
        bothHARoleAuth,
        requireOwnerOrAdmin(eventOwnerResolver),
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
        bothHARoleAuth,
        requireOwnerOrAdmin(eventOwnerResolver),
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