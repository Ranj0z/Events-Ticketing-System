//routing
import { Express } from "express";
import { createTicketController, deleteTicketController, getAllTicketController, getTicketAndUserController, getTicketByIdController, getTicketByUserIdController, updateTicketController } from "./ticket.controller";


//CRUD
const TicketRoutes = (app: Express) => {
    //route
    //Add new Ticket
    app.route("/ticket/newTicket").post(
        async (req, res, next) =>{
            try {
                await createTicketController(req, res);
            } catch (error: any) {
                next(error)
            }
        }
    )

    //get all Tickets
    app.route("/ticket/allTickets").get(
        async (req, res, next) =>{
            try {
                await getAllTicketController(req, res);
            } catch (error: any) {
                next(error)
            }
        }
    )

    //get Ticket by ID
    app.route("/ticket/:id").get(
        async (req, res, next) =>{
            try {
                await getTicketByIdController(req, res);
            } catch (error: any) {
                next(error)
            }
        }
    )

       //get Ticket by User ID
    app.route("/ticket/user/:id").get(
        async (req, res, next) =>{
            try {
                await getTicketByUserIdController(req, res);
            } catch (error: any) {
                next(error)
            }
        }
    )

        //get Ticket by User ID
    app.route("/ticket/User/:id").get(
        async (req, res, next) =>{
            try {
                await getTicketAndUserController(req, res);
            } catch (error: any) {
                next(error)
            }
        }
    )

    //update Ticket by id
    app.route("/ticket/updateticket/:id").patch(
        async (req, res, next) => {
            try {
                await updateTicketController(req, res);
            } catch (error) {
                next(error);
            }
        }
    );    

    //Delete Ticket by ID
    app.route("/ticket/delete/:id").delete(
        async (req, res, next) =>{
            try {
                await deleteTicketController(req, res);
            } catch (error: any) {
                next(error)
            }
        }
    )    
}

export default TicketRoutes;