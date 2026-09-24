//routing
import { Express } from "express";
import { createReservationController, deleteReservationController, getAllReservationsController, getReservationByEventIDController, getReservationByIdController, getReservationByUserIDController, getRsvpLookupController, linkGuestReservationsController, markReservationPaidController, markReservationUnpaidController, updateReservationController } from "./reservation.controller";
import { adminRoleAuth, allRoleAuth, requireOwnerOrAdmin } from "../../middleware/tokensAuth";
import { getReservationByRSVPIDService } from "./reservation.service";

// Ownership resolver for an RSVP accessed by its own RSVPID
const rsvpOwnerResolver = async (req: any) => {
    const reservation = await getReservationByRSVPIDService(parseInt(req.params.id));
    return reservation?.UserID ?? null;
}

//CRUD
const rsvpRoutes = (app: Express) => {
    // Create reservation(s) — body: { UserID?, cart: [{ TicketTypeID, quantity, attendees: [...] }] }
    app.route("/reservation/newRsvp").post(
        async (req, res, next) =>{
            try {
                await createReservationController(req, res);
            } catch (error: any) {
                next(error)
            }
        }
    )

    // Plan §5 — public ID-number lookup, scoped to one event: /reservation/lookup?eventId=&idNumber=
    app.route("/reservation/lookup").get(
        async (req, res, next) =>{
            try {
                await getRsvpLookupController(req, res);
            } catch (error: any) {
                next(error)
            }
        }
    )

    //get all Reservation
    app.route("/reservation/allRsvps").get(
        adminRoleAuth,
        async (req, res, next) =>{
            try {
                await getAllReservationsController(req, res);
            } catch (error: any) {
                next(error)
            }
        }
    )

    //get reservation by ID
    app.route("/reservation/:id").get(
        allRoleAuth,
        requireOwnerOrAdmin(rsvpOwnerResolver),
        async (req, res, next) =>{
            try {
                await getReservationByIdController(req, res);
            } catch (error: any) {
                next(error)
            }
        }
    )
    //get reservation by EventID
    app.route("/reservation/event/:id").get(
        async (req, res, next) =>{
            try {
                await getReservationByEventIDController(req, res);
            } catch (error: any) {
                next(error)
            }
        }
    )
    //get reservation by UserID
    app.route("/reservation/user/:id").get(
        allRoleAuth,
        requireOwnerOrAdmin(async (req) => parseInt(req.params.id)),
        async (req, res, next) =>{
            try {
                await getReservationByUserIDController(req, res);
            } catch (error: any) {
                next(error)
            }
        }
    )
    
    //update reservation by id
    app.route("/reservation/update/:id").patch(
        allRoleAuth,
        requireOwnerOrAdmin(rsvpOwnerResolver),
        async (req, res, next) => {
            try {
                await updateReservationController(req, res);
            } catch (error) {
                next(error);
            }
        }
    );    

    //Delete Reservation by ID
    app.route("/reservation/delete/:id").delete(
        allRoleAuth,
        requireOwnerOrAdmin(rsvpOwnerResolver),
        async (req, res, next) =>{
            try {
                await deleteReservationController(req, res);
            } catch (error: any) {
                next(error)
            }
        }
    )

    // Link selected guest RSVPs to the logged-in user's account
    app.route("/reservation/link-guest").post(
        allRoleAuth,
        async (req, res, next) =>{
            try {
                await linkGuestReservationsController(req, res);
            } catch (error: any) {
                next(error)
            }
        }
    )

    // Manually mark an RSVP as paid
    app.route("/reservation/markpaid/:id").patch(
        adminRoleAuth,
        async (req, res, next) =>{
            try {
                await markReservationPaidController(req, res);
            } catch (error: any) {
                next(error)
            }
        }
    )

    // Undo path — mark an RSVP back to unpaid
    app.route("/reservation/markunpaid/:id").patch(
        adminRoleAuth,
        async (req, res, next) =>{
            try {
                await markReservationUnpaidController(req, res);
            } catch (error: any) {
                next(error)
            }
        }
    )

    
}

export default rsvpRoutes;