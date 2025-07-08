// API

import { Request, Response } from "express";
import { createEventService, deleteEventService, getAllEventsService, getEventByIDService, getEventByVenueIDService, updateEventService } from "./events.service";

//Create a new Event
export const createEventController = async (req: Request, res: Response) =>{
    try {
        const newEvent = req.body;

        const createCar = await createEventService(newEvent)
        if (!createCar) {
            return res.json({message: "New Event not created"})
        } 
        return res.status(201).json({message: "New Event Created!!", newEvent})            
    } catch (error: any) {
        return res.status(500).json({error: error.message})
    }
}

//Get all Events from EventTable
export const getAllEventController = async (req: Request, res: Response) =>{
    try {
        const allEvents =req.body;

        const getAllEvents = await getAllEventsService();
         if (!getAllEvents || getAllEvents.length === 0) {
            return res.status(404).json({message: "No Events found"});
        }
        return res.status(200).json({Events: getAllEvents});
    
    } catch (error: any) {
        return res.status(500).json({error: error.message})        
    }
}


// get Event by id controller
export const getEventByIdController = async (req: Request, res: Response) => {
    try {
        const id  = parseInt (req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({message: "Invalid ID format"});
        }
        const getEventByID = await getEventByIDService(id);
        if (!getEventByID) {
            return res.status(404).json({message: "Event not found"});
        }
        return res.status(200).json({data: getEventByID});
    } catch (error: any) {
        return res.status(500).json({error: error.message});
    }
}

// get Event by Venue id controller
export const getEventByVenueIdController = async (req: Request, res: Response) => {
    try {
        const id  = parseInt (req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({message: "Invalid ID format"});
        }
        const getEventByID = await getEventByVenueIDService(id);
        if (!getEventByID) {
            return res.status(404).json({message: "Event not found"});
        }
        return res.status(200).json({data: getEventByID});
    } catch (error: any) {
        return res.status(500).json({error: error.message});
    }
}


// Update Event 
export const updateEventController = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({message: "Invalid ID format"});
        }
        
        const EventUpdates = req.body;
        
        // Convert dueDate to Date object if provided
        if (EventUpdates.dueDate) {
            EventUpdates.dueDate = new Date(EventUpdates.dueDate);
        }

        const updatedMessage = await updateEventService(id, EventUpdates);
        if (!updatedMessage) {
            return res.status(404).json({message: "Event not found !!"});
        }        
        return res.status(200).json({message: updatedMessage});
    } catch (error: any) {
        return res.status(500).json({error: error.message});
    }
}

// delete Event controller
export const deleteEventController = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({message: "Invalid ID format"});
        }
        
        const deletedMessage = await deleteEventService(id);
        if (!deletedMessage) {
            return res.status(404).json({message: "Event not found !!!"});
        }
        return res.status(200).json({message: deletedMessage});
    } catch (error: any) {
        return res.status(500).json({error: error.message});
    }
}


