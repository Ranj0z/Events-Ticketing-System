import { Express } from "express";
import {
  addEventImageController,
  getEventImagesController,
  deleteEventImageController,
} from "./event-images.controller";
import { bothHARoleAuth, requireOwnerOrAdmin } from "../../middleware/tokensAuth";
import { getEventByIDService } from "../events/events.service";
import { getEventImageOwnerHostIdService } from "./event-images.service";

/**
 * event-images routes
 *
 * GET    /event-images/event/:id  – public, read-only, ordered carousel images for an event
 * POST   /event-images/event/:id  – add a carousel image — Owner (Host) or Admin
 * DELETE /event-images/:id        – remove a carousel image — Owner (Host) or Admin
 */

// For create: the resource being created belongs to the event, so ownership is
// the event's own HostID.
const eventOwnerResolver = async (req: any) => {
  const event = await getEventByIDService(parseInt(req.params.id));
  return event?.HostID ?? null;
};

// For delete: ownership isn't a direct field on event_images — it's derived via
// EventID -> events.HostID.
const eventImageOwnerResolver = async (req: any) => {
  return getEventImageOwnerHostIdService(parseInt(req.params.id));
};

const EventImageRoutes = (app: Express) => {
  app.route("/event-images/event/:id")
    .get(
      async (req, res, next) => {
        try {
          await getEventImagesController(req, res);
        } catch (error: any) {
          next(error);
        }
      }
    )
    .post(
      bothHARoleAuth,
      requireOwnerOrAdmin(eventOwnerResolver),
      async (req, res, next) => {
        try {
          await addEventImageController(req, res);
        } catch (error: any) {
          next(error);
        }
      }
    );

  app.route("/event-images/:id").delete(
    bothHARoleAuth,
    requireOwnerOrAdmin(eventImageOwnerResolver),
    async (req, res, next) => {
      try {
        await deleteEventImageController(req, res);
      } catch (error: any) {
        next(error);
      }
    }
  );
};

export default EventImageRoutes;
