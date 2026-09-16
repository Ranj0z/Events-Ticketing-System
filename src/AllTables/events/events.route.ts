import { Express } from "express";
import { createEventController, deleteEventController, getAllEventController, getEventByIdController, getEventBySlugController, getEventsAttendedByUserIdController, getEventsByHostIdController, getEventByVenueIdController, updateEventController } from "./events.controller";
import { bothHARoleAuth, requireOwnerOrAdmin } from "../../middleware/tokensAuth";
import { getEventByIDService } from "./events.service";

const eventOwnerResolver = async (req: any) => {
    const event = await getEventByIDService(parseInt(req.params.id));
    return event?.HostID ?? null;
}

const EventRoutes = (app: Express) => {
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

    app.route("/event/allevents").get(
        async (req, res, next) =>{
            try {
                await getAllEventController(req, res);
            } catch (error: any) {
                next(error)
            }
        }
    )

    // Public. Registered ahead of "/event/:id" for readability — no actual collision:
    // ":id" only matches a single path segment, so it never swallows the two-segment
    // "/event/slug/:slug" path.
    app.route("/event/slug/:slug").get(
        async (req, res, next) =>{
            try {
                await getEventBySlugController(req, res);
            } catch (error: any) {
                next(error)
            }
        }
    )

    app.route("/event/:id").get(
        async (req, res, next) =>{
            try {
                await getEventByIdController(req, res);
            } catch (error: any) {
                next(error)
            }
        }
    )

    app.route("/event/venue/:id").get(
        async (req, res, next) =>{
            try {
                await getEventByVenueIdController(req, res);
            } catch (error: any) {
                next(error)
            }
        }
    )

    app.route("/event/user/:id").get(
        async (req, res, next) =>{
            try {
                await getEventsAttendedByUserIdController(req, res);
            } catch (error: any) {
                next(error)
            }
        }
    )

    app.route("/event/host/:id").get(
        async (req, res, next) =>{
            try {
                await getEventsByHostIdController(req, res);
            } catch (error: any) {
                next(error)
            }
        }
    )
    
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