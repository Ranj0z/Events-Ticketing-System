import { Request, Response } from "express";
import {
  getTicketTypesByEventIdService,
  createTicketTypeService,
  updateTicketTypeService,
  CreateTicketTypeInput,
  UpdateTicketTypeInput,
} from "./ticket-type.service";

// Get all Ticket Types for an Event (public, read-only)
export const getTicketTypesByEventIdController = async (req: Request, res: Response) => {
  try {
    const EventID = parseInt(req.params.id);
    if (isNaN(EventID)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    const ticketTypes = await getTicketTypesByEventIdService(EventID);
    if (!ticketTypes || ticketTypes.length === 0) {
      return res.status(404).json({ message: "No ticket types found for this event" });
    }

    return res.status(200).json({ data: ticketTypes });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// Validates the required fields for a new ticket-type tier.
const validateCreateInput = (data: any): string | null => {
  if (!data.name || typeof data.name !== "string") return "name is required";

  const kind = data.type ?? "individual";
  if (kind !== "individual" && kind !== "group") return "type must be 'individual' or 'group'";

  if (typeof data.price !== "number" || data.price < 0) return "price must be a number >= 0";
  if (typeof data.totalQuantity !== "number" || data.totalQuantity < 1) return "totalQuantity must be a number >= 1";

  if (kind === "group") {
    if (data.groupSize === undefined || data.groupSize === null || data.groupSize < 2) {
      return "groupSize is required and must be >= 2 for group ticket types";
    }
  } else if (data.groupSize !== undefined && data.groupSize !== null) {
    return "groupSize must not be set for individual ticket types";
  }

  return null;
};

// Create a new ticket-type tier for an event. Owner (Host) or Admin only — enforced
// in the route via requireOwnerOrAdmin.
export const createTicketTypeController = async (req: Request, res: Response) => {
  try {
    const EventID = parseInt(req.params.id);
    if (isNaN(EventID)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    const reason = validateCreateInput(req.body);
    if (reason) {
      return res.status(400).json({ message: reason });
    }

    const created = await createTicketTypeService(EventID, req.body as CreateTicketTypeInput);
    return res.status(201).json({ message: "Ticket type created", ticketType: created });
  } catch (error: any) {
    console.error("createTicketTypeController error:", error);
    return res.status(500).json({ error: error.message });
  }
};

// Update, suspend, or reactivate a ticket-type tier. Owner (Host) or Admin only —
// enforced in the route via requireOwnerOrAdmin.
export const updateTicketTypeController = async (req: Request, res: Response) => {
  try {
    const ticketTypeId = parseInt(req.params.id);
    if (isNaN(ticketTypeId)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    const result = await updateTicketTypeService(ticketTypeId, req.body as UpdateTicketTypeInput);

    if (result.error === "not_found") {
      return res.status(404).json({ message: "Ticket type not found" });
    }
    if (result.error === "locked_fields") {
      return res.status(400).json({
        message: `Cannot update ${result.fields.join(", ")} — this ticket type has sales, only 'status' may be changed`,
      });
    }

    return res.status(200).json({ message: "Ticket type updated", ticketType: result.ticketType });
  } catch (error: any) {
    console.error("updateTicketTypeController error:", error);
    return res.status(500).json({ error: error.message });
  }
};