import { Express } from "express";
import { getTicketTypesByEventIdController } from "./ticket-type.controller";

/**
 * ticket-type routes
 *
 * GET /ticket-type/event/:id – public, read-only, returns all tiers for an event
 * (used for displaying an event's tiers and for RSVP cart-building)
 *
 * No create/update/delete endpoints — ticket types are only written as part
 * of event creation (see events domain) and are never edited afterward.
 */

const TicketTypeRoutes = (app: Express) => {
  app.route("/ticket-type/event/:id").get(
    async (req, res, next) => {
      try {
        await getTicketTypesByEventIdController(req, res);
      } catch (error: any) {
        next(error);
      }
    }
  );
};

export default TicketTypeRoutes;
