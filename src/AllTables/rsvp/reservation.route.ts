//routing
import { Express } from "express";
import { createReservationController, deleteReservationController, getAllReservationsController, getReservationByEventIDController, getReservationByIdController, getReservationByUserIDController, updateReservationController } from "./reservation.controller";


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
    app.route("/reservation/update/:id").put(
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

    
}

export default rsvpRoutes;