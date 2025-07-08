// API

import { Request, Response } from "express";
import { createVenueService, deleteVenueService, getAllVenuesService, getVenueByIDService, updateVenueService } from "../tickets/ticket.service";



//Create a new Venue
export const createVenueController = async (req: Request, res: Response) =>{
    try {
        const newVenue = req.body;

        const createCar = await createVenueService(newVenue)
        if (!createCar) {
            return res.json({message: "New Venue not created"})
        } 
        return res.status(201).json({message: "New Venue Created!!", newVenue})            
    } catch (error: any) {
        return res.status(500).json({error: error.message})
    }
}

//Get all Venues from VenueTable
export const getAllVenueController = async (req: Request, res: Response) =>{
    try {
        const allVenues =req.body;

        const getAllVenues = await getAllVenuesService();
         if (!getAllVenues || getAllVenues.length === 0) {
            return res.status(404).json({message: "No Venues found"});
        }
        return res.status(200).json({Venues: getAllVenues});
    
    } catch (error: any) {
        return res.status(500).json({error: error.message})        
    }
}

// get Venue by id controller
export const getVenueByIdController = async (req: Request, res: Response) => {
    try {
        const id  = parseInt (req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({message: "Invalid ID format"});
        }
        const getVenueByID = await getVenueByIDService(id);
        if (!getVenueByID) {
            return res.status(404).json({message: "Venue not found"});
        }
        return res.status(200).json({data: getVenueByID});
    } catch (error: any) {
        return res.status(500).json({error: error.message});
    }
}

// Update Venue 
export const updateVenueController = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({message: "Invalid ID format"});
        }
        
        const VenueUpdates = req.body;
        
        // Convert dueDate to Date object if provided
        if (VenueUpdates.dueDate) {
            VenueUpdates.dueDate = new Date(VenueUpdates.dueDate);
        }

        const updatedMessage = await updateVenueService(id, VenueUpdates);
        if (!updatedMessage) {
            return res.status(404).json({message: "Venue not found !!"});
        }        
        return res.status(200).json({message: updatedMessage});
    } catch (error: any) {
        return res.status(500).json({error: error.message});
    }
}

// delete Venue controller
export const deleteVenueController = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({message: "Invalid ID format"});
        }
        
        const deletedMessage = await deleteVenueService(id);
        if (!deletedMessage) {
            return res.status(404).json({message: "Venue not found !!!"});
        }
        return res.status(200).json({message: deletedMessage});
    } catch (error: any) {
        return res.status(500).json({error: error.message});
    }
}


