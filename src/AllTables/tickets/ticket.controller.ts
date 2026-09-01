// API

import { Request, Response } from "express";
import { createTicketService, deleteTicketService, getAllTicketsService, getTicketAndUserService, getTicketByIDService, getTicketByUserIDService, updateTicketService } from "./ticket.service";


//Create a new Ticket
export const createTicketController = async (req: Request, res: Response) =>{
    try {
        const newTicket = req.body;

        const createTicket = await createTicketService(newTicket)
        if (!createTicket) {
            return res.json({message: "New Ticket not created"})
        } 
        return res.status(201).json({message: "Customer support ticket created successfully", newTicket: createTicket})            
    } catch (error: any) {
        return res.status(500).json({error: error.message})
    }
}

//Get all Tickets from TicketTable
export const getAllTicketController = async (req: Request, res: Response) =>{
    try {
        const allTickets =req.body;

        const getAllTickets = await getAllTicketsService();
         if (!getAllTickets) {
            return res.status(404).json({message: "No Tickets found"});
        }
        return res.status(200).json({message: "Customer support tickets retrieved successfully", Tickets: getAllTickets});
    
    } catch (error: any) {
        return res.status(500).json({error: error.message})        
    }
}


// get Ticket by id controller
export const getTicketByIdController = async (req: Request, res: Response) => {
    try {
        const id  = parseInt (req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({message: "Invalid ID format"});
        }
        const getTicketByID = await getTicketByIDService(id);
        if (!getTicketByID) {
            return res.status(404).json({message: "Ticket not found"});
        }
        return res.status(200).json({message: "Customer support ticket retrieved successfully", Tickets: getTicketByID});
    } catch (error: any) {
        return res.status(500).json({error: error.message});
    }
}

// get Ticket by userid controller
export const getTicketByUserIdController = async (req: Request, res: Response) => {
    try {
        const id  = parseInt (req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({message: "Invalid ID format"});
        }
        const getTicketByID = await getTicketByUserIDService(id);
        if (!getTicketByID) {
            return res.status(404).json({message: "User not found"});
        }
        return res.status(200).json({message: "Customer support ticket retrieved successfully", Tickets: getTicketByID});
    } catch (error: any) {
        return res.status(500).json({error: error.message});
    }
}

// get Ticket by userid controller
export const getTicketAndUserController = async (req: Request, res: Response) => {
    try {
        const id  = parseInt (req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({message: "Invalid ID format"});
        }
        const getTicketByID = await getTicketAndUserService(id);
        if (!getTicketByID) {
            return res.status(404).json({message: "User not found"});
        }
        return res.status(200).json({message: "Customer support ticket retrieved successfully", Tickets: getTicketByID});
    } catch (error: any) {
        return res.status(500).json({error: error.message});
    }
}

// Update Ticket 
export const updateTicketController = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({message: "Invalid ID format"});
        }
        
        const TicketUpdates = req.body;
        
       const getEventByID = await getTicketByIDService(id);
               if (!getEventByID) {
                   return res.status(404).json({message: "Ticket not found"});
               }  

        const updatedTicket = await updateTicketService(id, TicketUpdates);
        if (!updatedTicket) {
            return res.status(404).json({message: "Ticket not Updated !!"});
        }     
           
        return res.status(200).json({
            message: "Customer support ticket updated successfully", 
            updatedTicket
        });
    } catch (error: any) {
        return res.status(500).json({error: error.message});
    }
}

// delete Ticket controller
export const deleteTicketController = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({message: "Invalid ID format"});
        }
        
        const deletedTicket = await getTicketByIDService(id);
            if (!deletedTicket ){
                return res.status(404).json({message: "Ticket not found !!!  Failed to delete"});
            }
            
            const delEvent =await deleteTicketService(id);        
    
            if(delEvent.length >0){
                return res.status(200).json({message: "Customer support ticket deleted successfully", deletedTicket});
            }
            return res.status(404).json({message: "Failed to delete"});
    } catch (error: any) {
        return res.status(500).json({error: error.message});
    }
}


