import { Request, Response } from "express";
import { getTicketTypesByEventIdService } from "./ticket-type.service";

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
