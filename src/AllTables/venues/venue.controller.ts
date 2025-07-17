// API

import { Request, Response } from "express";
import { createVenueService, deleteVenueService, getAllVenuesService, getVenueByIDService, updateVenueService } from "./venue.service";



//Create a new Venue
export const createVenueController = async (req: Request, res: Response) =>{
    try {
        const newVenue = req.body;

        const createVenue = await createVenueService(newVenue)
        if (!createVenue) {
            return res.json({message: "New Venue not created"})
        } 
        return res.status(201).json({ message: "New Venue Created!!", venue: createVenue });
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
            return res.status(404).json({message: "Venue not found!!"});
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

        const getVenueByID = await getVenueByIDService(id);
            if (!getVenueByID) {
                return res.status(404).json({message: "Venue not found"});
        }       

        const updated = await updateVenueService(id, VenueUpdates);
        if (!updated) {
            return res.status(404).json({message: "Venue not Updated !!"});
        }       

        return res.status(200).json({message: "Venue updated successfully ✅", updated});
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
        
        const deletedVenue = await getVenueByIDService(id);
        if (!deletedVenue) {
            return res.status(404).json({message: "Venue not found!!!! Failed to delete"});
        }

        const deleteVenue =await deleteVenueService(id);

         if(deleteVenue.length = 0){
        return res.status(500).json({message: "Venue deleting failed due to error"})
    }
        return res.status(200).json({message: "Venue deleted Successfully!!", deletedVenue});
    } catch (error: any) {
        return res.status(500).json({error: error.message});
    }
}


