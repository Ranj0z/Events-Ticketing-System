//routing
import { Express } from "express";
import { createTicketController, deleteTicketController, getAllTicketController, getTicketAndUserController, getTicketByIdController, getTicketByUserIdController, updateTicketController } from "./ticket.controller";
import { allRoleAuth, requireOwnerOrAdmin } from "../../middleware/tokensAuth";
import { getTicketByIDService } from "./ticket.service";

// Ownership resolver for a support ticket accessed by its own TicketID
const ticketOwnerResolver = async (req: any) => {
    const ticket = await getTicketByIDService(parseInt(req.params.id));
    return ticket?.UserID ?? null;
}

//CRUD
const TicketRoutes = (app: Express) => {
    //route
    //Add new Ticket
    app.route("/ticket/newTicket").post(
        allRoleAuth,
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
        allRoleAuth,
        requireOwnerOrAdmin(ticketOwnerResolver),
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
        allRoleAuth,
        requireOwnerOrAdmin(async (req) => parseInt(req.params.id)),
        async (req, res, next) =>{
            try {
                await getTicketByUserIdController(req, res);
            } catch (error: any) {
                next(error)
            }
        }
    )

        //get Ticket by User ID
    app.route("/ticket/ticketAndUser/:id").get(
        allRoleAuth,
        requireOwnerOrAdmin(async (req) => parseInt(req.params.id)),
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
        allRoleAuth,
        requireOwnerOrAdmin(ticketOwnerResolver),
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
        allRoleAuth,
        requireOwnerOrAdmin(ticketOwnerResolver),
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