// API

import { Request, Response } from "express";
import { createTicketService, deleteTicketService, getAllTicketsService, getTicketByIDService, getTicketByUserIDService, updateTicketService } from "../venues/venue.service";


//Create a new Ticket
export const createTicketController = async (req: Request, res: Response) =>{
    try {
        const newTicket = req.body;

        const createCar = await createTicketService(newTicket)
        if (!createCar) {
            return res.json({message: "New Ticket not created"})
        } 
        return res.status(201).json({message: "New Ticket Created!!", newTicket})            
    } catch (error: any) {
        return res.status(500).json({error: error.message})
    }
}

//Get all Tickets from TicketTable
export const getAllTicketController = async (req: Request, res: Response) =>{
    try {
        const allTickets =req.body;

        const getAllTickets = await getAllTicketsService();
         if (!getAllTickets || getAllTickets.length === 0) {
            return res.status(404).json({message: "No Tickets found"});
        }
        return res.status(200).json({Tickets: getAllTickets});
    
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
        return res.status(200).json({data: getTicketByID});
    } catch (error: any) {
        return res.status(500).json({error: error.message});
    }
}

// get Ticket by id controller
export const getTicketByUserIdController = async (req: Request, res: Response) => {
    try {
        const id  = parseInt (req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({message: "Invalid ID format"});
        }
        const getTicketByID = await getTicketByUserIDService(id);
        if (!getTicketByID) {
            return res.status(404).json({message: "Ticket not found"});
        }
        return res.status(200).json({data: getTicketByID});
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
        
        // Convert dueDate to Date object if provided
        if (TicketUpdates.dueDate) {
            TicketUpdates.dueDate = new Date(TicketUpdates.dueDate);
        }

        const updatedMessage = await updateTicketService(id, TicketUpdates);
        if (!updatedMessage) {
            return res.status(404).json({message: "Ticket not found !!"});
        }        
        return res.status(200).json({message: updatedMessage});
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
        
        const deletedMessage = await deleteTicketService(id);
        if (!deletedMessage) {
            return res.status(404).json({message: "Ticket not found !!!"});
        }
        return res.status(200).json({message: deletedMessage});
    } catch (error: any) {
        return res.status(500).json({error: error.message});
    }
}


