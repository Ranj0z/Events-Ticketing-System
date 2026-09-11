// API

import { Request, Response } from "express";
import { createEventService, deleteEventService, getAllEventsService, getEventByIDService, getEventsAttendedByUserIDService, getEventsByHostIDService, getEventByVenueIDService, updateEventService } from "./events.service";



//Create a new Event
export const createEventController = async (req: Request, res: Response) =>{
    try {
        // Never trust a client-supplied HostID — the event's host is always
        // the authenticated user creating it.
        const { HostID: _clientHostID, ...eventInput } = req.body;
        const user = (req as any).user;
        const newEvent = { ...eventInput, HostID: user?.user_id };

        const createEvent = await createEventService(newEvent)
        if (!createEvent) {
            return res.json({message: "New Event not created"})
        } 
        return res.status(201).json({message: "New Event Created!!", newEvent: createEvent})            
    } catch (error: any) {
        console.error("createEventController error:", error);
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
        console.error("getAllEventController error:", error);
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
        console.error("getEventByIdController error:", error);
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
        console.error("getEventByVenueIdController error:", error);
        return res.status(500).json({error: error.message});
    }
}

// get events a user has RSVP'd to (attended/booked), by user id controller
export const getEventsAttendedByUserIdController = async (req: Request, res: Response) => {
    try {
        const id  = parseInt (req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({message: "Invalid ID format"});
        }
        const getEventByID = await getEventsAttendedByUserIDService(id);
        if (!getEventByID) {
            return res.status(404).json({message: "Event not found"});
        }
        return res.status(200).json({data: getEventByID});
    } catch (error: any) {
        console.error("getEventsAttendedByUserIdController error:", error);
        return res.status(500).json({error: error.message});
    }
}

// get events a host organizes, by host (user) id controller
export const getEventsByHostIdController = async (req: Request, res: Response) => {
    try {
        const id  = parseInt (req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({message: "Invalid ID format"});
        }
        const events = await getEventsByHostIDService(id);
        if (!events) {
            return res.status(404).json({message: "Event not found"});
        }
        return res.status(200).json({data: events});
    } catch (error: any) {
        console.error("getEventsByHostIdController error:", error);
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
        console.error("updateEventController error:", error);
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
        console.error("deleteEventController error:", error);
        return res.status(500).json({message: "Event deleting failed"});
    }
}