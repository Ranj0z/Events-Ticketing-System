//routing
import { Express } from "express";
import { deletePaymentController, getAllPaymentsController, getPaymentByEventIDController, getPaymentByIdController, getPaymentByRSVPIDController, makePaymentController } from "./payment.controller";

//CRUD
const paymentRoutes = (app: Express) => {
    //route
//make a Payment
    app.route("/payment/makePayment").post(
        
        async (req, res, next) =>{
            try {
                await makePaymentController(req, res);
            } catch (error) {
                next(error);
            }
        }
    )

//Get all payments
    app.route("/payment/allPayment").get(
        async (req, res, next) =>{
            try {
                await getAllPaymentsController(req, res);
                // return 
            } catch (error) {
                next(error);
            }
        }
    )

//get Payment by ID
    app.route("/payment/:id").get(
        async (req, res, next) =>{
            try {
                await getPaymentByIdController(req, res);
            } catch (error: any) {
                next(error)
            }
        }
    )

    //Get Payment by eventID
    app.route("/payment/event/:id").get(
        async (req, res, next) =>{
            try {
                await getPaymentByEventIDController(req, res);
            } catch (error: any) {
                next(error)
            }
        }
    )

    //Get Payment by rsvpID
    app.route("/payment/rsvp/:id").get(
        async (req, res, next) =>{
            try {
                await getPaymentByRSVPIDController(req, res);
            } catch (error: any) {
                next(error)
            }
        }
    )

    //Delete Payment by ID
    app.route("/payment/delete/:id").delete(
        async (req, res, next) =>{
            try {
                await deletePaymentController(req, res);
            } catch (error: any) {
                next(error)
            }
        }
    )    
}

export default paymentRoutes;

