// API

import { Request, Response } from "express";
import { createEventService, deleteEventService, getAllEventsService, getEventByIDService, getEventsByUserIDService, getEventByVenueIDService, updateEventService } from "./events.service";



//Create a new Event
export const createEventController = async (req: Request, res: Response) =>{
    try {
        const newEvent = req.body;

        const createEvent = await createEventService(newEvent)
        if (!createEvent) {
            return res.json({message: "New Event not created"})
        } 
        return res.status(201).json({message: "New Event Created!!", newEvent: createEvent})            
    } catch (error: any) {
        return res.status(500).json({error: error.message})
    }
}

//Get all Events from EventTable
export const getAllEventController = async (req: Request, res: Response) =>{
    try {
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
        return res.status(200).json({event: getEventByID});
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

// get Event by User id controller
export const getEventByUserIdController = async (req: Request, res: Response) => {
    try {
        const id  = parseInt (req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({message: "Invalid ID format"});
        }
        const getEventByID = await getEventsByUserIDService(id);
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

        const getEventByID = await getEventByIDService(id);
        if (!getEventByID) {
            return res.status(404).json({message: "Event not found"});
        }       

        const updated = await updateEventService(id, EventUpdates);
        if (!updated) {
            return res.status(404).json({message: "Event not Updated !!"});
        }  
           
        return res.status(200).json({message: "Event updated successfully ✅", updated});
    } catch (error: any) {
        return res.status(500).json({error: error.message });
    }
}

// delete Event controller
export const deleteEventController = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({message: "Invalid ID format"});
        }
        
        const deletedEvent = await getEventByIDService(id);
        if (!deletedEvent) {
            return res.status(404).json({message: "Event not found !!!  Failed to delete"});
        }
        
        const delEvent =await deleteEventService(id);        

        if(delEvent.length >0){
            return res.status(200).json({message: "Event deleted Successfully!!", deletedEvent});
        }
        
    } catch (error: any) {
        return res.status(500).json({message: "Event deleting failed"});
    }
}


