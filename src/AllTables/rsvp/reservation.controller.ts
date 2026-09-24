// API

import { Request, Response } from "express";
import {
  CartLine,
  createReservationService,
  deleteReservationService,
  getAllReservationsService,
  getReservationByEventIDService,
  getReservationByRSVPIDService,
  getReservationByUserIDService,
  getRsvpLookupService,
  linkGuestReservationsService,
  markReservationPaidService,
  markReservationUnpaidService,
  updateReservationService,
} from "./reservation.service";
import { getUserByIDService } from "../auth/auth.service";

// L1 — cart shape validation. Returns an error message string, or null if valid.
const validateCart = (cart: unknown): string | null => {
  if (!Array.isArray(cart) || cart.length === 0) {
    return "cart must be a non-empty array";
  }

  for (const line of cart as CartLine[]) {
    if (!line || typeof line.TicketTypeID !== "number" || typeof line.quantity !== "number" || line.quantity < 1) {
      return "Each cart line needs a valid TicketTypeID and a quantity of at least 1";
    }
    if (!Array.isArray(line.attendees) || line.attendees.length !== line.quantity) {
      return "attendees.length must equal quantity for every cart line";
    }
    for (const attendee of line.attendees) {
      if (!attendee?.firstName || !attendee?.lastName || !attendee?.email || !attendee?.phoneNumber) {
        return "Every attendee needs firstName, lastName, email, and phoneNumber";
      }
      if (attendee.idNumber !== undefined && typeof attendee.idNumber !== "string") {
        return "idNumber must be a string when provided";
      }
    }
  }

  return null;
};

//Get all Reservation
export const getAllReservationsController = async (req: Request, res: Response) => {
  try {
    const getAllReservations = await getAllReservationsService();
    if (!getAllReservations || getAllReservations.length === 0) {
      return res.status(404).json({ message: "No RSVP found" });
    }
    return res.status(200).json({ reservations: getAllReservations });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const createReservationController = async (req: Request, res: Response) => {
  try {
    const { UserID, cart } = req.body;

    const validationError = validateCart(cart);
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const result = await createReservationService({ UserID, cart });

    if ("error" in result) {
      // §5 — ticket_type_inactive covers both suspended and expired tiers
      if (result.error === "ticket_type_inactive") {
        return res.status(409).json({ message: "This ticket type is no longer available", ...result });
      }
      // Partial-payments plan §3/§7 — Option A guards
      if (result.error === "partial_payments_single_ticket_only") {
        return res.status(409).json({ message: "This event only supports single-ticket checkout for partial payments", ...result });
      }
      if (result.error === "id_number_required") {
        return res.status(400).json({ message: "idNumber is required for this event", ...result });
      }
      if (result.error === "id_number_already_used") {
        return res.status(409).json({ message: "This ID number has already been used to RSVP for this event", ...result });
      }
      return res.status(409).json({ message: "Event full, ticket type sold out, or not found", ...result });
    }

    if ("partialPaymentsEnabled" in result && result.partialPaymentsEnabled) {
      return res.status(201).json({
        message: "Reservation held — pay any installment (min KES 100), or the exact remaining balance, to confirm",
        bookingConfirmed: false,
        requiresPayment: true,
        partialPayment: true,
        holdExpiresAt: result.rsvps[0]?.holdExpiresAt ?? null,
        ...result,
      });
    }

    if (result.payment === null) {
      return res.status(201).json({
        message: "You're booked!",
        bookingConfirmed: true,
        requiresPayment: false,
        ...result,
      });
    }

    return res.status(201).json({
      message: "Reservation held — complete payment to confirm your booking",
      bookingConfirmed: false,
      requiresPayment: true,
      holdExpiresAt: result.rsvps[0]?.holdExpiresAt ?? null,
      ...result,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// Plan §5 — unauthenticated lookup by ID number, scoped to one event.
// Query: /reservation/lookup?eventId=...&idNumber=...
export const getRsvpLookupController = async (req: Request, res: Response) => {
  try {
    const eventId = parseInt(req.query.eventId as string);
    const idNumber = typeof req.query.idNumber === "string" ? req.query.idNumber : undefined;
    if (isNaN(eventId) || !idNumber) {
      return res.status(400).json({ message: "eventId and idNumber are required" });
    }

    const result = await getRsvpLookupService(eventId, idNumber);
    if (!result) {
      return res.status(404).json({ message: "No reservation found for that ID number" });
    }
    return res.status(200).json({ data: result });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// get Reservation by id controller
export const getReservationByIdController = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }
    const getReservationByID = await getReservationByRSVPIDService(id);
    if (!getReservationByID) {
      return res.status(404).json({ message: "Reservation not found" });
    }
    return res.status(200).json({ reservations: getReservationByID });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// Get reservation By EventID
export const getReservationByEventIDController = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }
    const getReservationByID = await getReservationByEventIDService(id);
    if (!getReservationByID) {
      return res.status(404).json({ message: "Reservation not found" });
    }
    return res.status(200).json({ reservation: getReservationByID });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// Get reservation By UserID
export const getReservationByUserIDController = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }
    const getReservationByID = await getReservationByUserIDService(id);
    if (!getReservationByID) {
      return res.status(404).json({ message: "Reservation not found" });
    }
    return res.status(200).json({ reservation: getReservationByID });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// Update reservation
export const updateReservationController = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    const reservationUpdates = req.body;

    const rsvpExisted = await getReservationByRSVPIDService(id);
    if (!rsvpExisted) {
      return res.status(404).json({ message: "Reservation not found!!" });
    }

    const updated = await updateReservationService(id, reservationUpdates);
    if (!updated) {
      return res.status(404).json({ message: "Reservation not updated" });
    }
    return res.status(200).json({ message: "Reservation updated successfully ✅", updated });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// delete reservation controller
export const deleteReservationController = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    const deletedRSVP = await getReservationByRSVPIDService(id);
    if (!deletedRSVP) {
      return res.status(404).json({ message: "Reservation not found !!!  Failed to delete" });
    }

    const deleted = await deleteReservationService(id);
    if (deleted.length > 0) {
      return res.status(200).json({ message: "Reservation deleted Successfully!!", deletedRSVP });
    }
  } catch (error: any) {
    return res.status(500).json({ message: "Reservation not deleted!!" });
  }
};

// Link chosen guest RSVPs to the authenticated user's account.
// Body: { rsvpIDs: number[] } — the ones the user checked/selected on the frontend,
// or every ID from the unlinked list if they hit "add all".
export const linkGuestReservationsController = async (req: Request, res: Response) => {
  try {
    const userID = (req as any).user?.user_id;
    if (!userID) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { rsvpIDs } = req.body;
    if (!Array.isArray(rsvpIDs) || rsvpIDs.length === 0) {
      return res.status(400).json({ message: "rsvpIDs must be a non-empty array" });
    }

    // Look up the account's email server-side rather than trusting the client
    const user = await getUserByIDService(userID);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const linked = await linkGuestReservationsService(userID, user.email, rsvpIDs);
    return res.status(200).json({ message: "Reservations linked ✅", linked });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// Manually mark an RSVP as paid (e.g. cash payment, manual reconciliation)
export const markReservationPaidController = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    const rsvpExisted = await getReservationByRSVPIDService(id);
    if (!rsvpExisted) {
      return res.status(404).json({ message: "Reservation not found!!" });
    }

    const updated = await markReservationPaidService(id);
    return res.status(200).json({ message: "Reservation marked as paid ✅", updated });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// Undo path — mark an RSVP back to unpaid
export const markReservationUnpaidController = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    const rsvpExisted = await getReservationByRSVPIDService(id);
    if (!rsvpExisted) {
      return res.status(404).json({ message: "Reservation not found!!" });
    }

    const updated = await markReservationUnpaidService(id);
    return res.status(200).json({ message: "Reservation marked as unpaid ✅", updated });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};