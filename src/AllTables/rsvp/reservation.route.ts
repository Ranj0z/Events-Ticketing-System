//routing
import { Express } from "express";
import { createReservationController, deleteReservationController, getAllReservationsController, getReservationByEventIDController, getReservationByIdController, getReservationByUserIDController, linkGuestReservationsController, markReservationPaidController, markReservationUnpaidController, updateReservationController } from "./reservation.controller";
import { allRoleAuth } from "../../middleware/tokensAuth";


//CRUD
const rsvpRoutes = (app: Express) => {
    //route
    app.route("/reservation/newRsvp").post(
        async (req, res, next) =>{
            try {
                await createReservationController(req, res);
            } catch (error: any) {
                next(error)
            }
        }
    )

    //get all Reservation
    app.route("/reservation/allRsvps").get(
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