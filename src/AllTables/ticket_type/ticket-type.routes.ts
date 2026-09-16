import { Express } from "express";
import {
  getTicketTypesByEventIdController,
  createTicketTypeController,
  updateTicketTypeController,
} from "./ticket-type.controller";
import { bothHARoleAuth, requireOwnerOrAdmin } from "../../middleware/tokensAuth";
import { getEventByIDService } from "../events/events.service";
import { getTicketTypeOwnerHostIdService } from "./ticket-type.service";

/**
 * ticket-type routes
 *
 * GET   /ticket-type/event/:id   – public, read-only, all tiers for an event
 * POST  /ticket-type/event/:id   – create a new tier — Owner (Host) or Admin
 * PATCH /ticket-type/update/:id  – update / suspend / reactivate a tier — Owner (Host) or Admin
 *
 * No delete route — suspending a tier removes it from public view instead.
 */

// For create: the resource being created belongs to the event, so ownership is
// the event's own HostID.
const eventOwnerResolver = async (req: any) => {
  const event = await getEventByIDService(parseInt(req.params.id));
  return event?.HostID ?? null;
};

// For update: ownership isn't a direct field on ticket_type — it's derived via
// EventID -> events.HostID.
const ticketTypeOwnerResolver = async (req: any) => {
  return getTicketTypeOwnerHostIdService(parseInt(req.params.id));
};

const TicketTypeRoutes = (app: Express) => {
  app.route("/ticket-type/event/:id")
    .get(
      async (req, res, next) => {
        try {
          await getTicketTypesByEventIdController(req, res);
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
          await createTicketTypeController(req, res);
        } catch (error: any) {
          next(error);
        }
      }
    );

  app.route("/ticket-type/update/:id").patch(
    bothHARoleAuth,
    requireOwnerOrAdmin(ticketTypeOwnerResolver),
    async (req, res, next) => {
      try {
        await updateTicketTypeController(req, res);
      } catch (error: any) {
        next(error);
      }
    }
  );
};

export default TicketTypeRoutes;