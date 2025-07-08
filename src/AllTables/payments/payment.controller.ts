//API

import { deletePaymentService, getAllPaymentsService, getPaymentByEventIDService, getPaymentByIDService, getPaymentByRSVPIDService, makePaymentService } from "./payment.service";
import { Request, Response } from "express";

//make payment controller

export const makePaymentController = async( req: Request, res: Response) =>{
    try {
        const payment = req.body;

        const makePayment = await makePaymentService(payment)
        if (!makePayment) 
            return res.json({message: "Payment not successfull"})
            return res.status(201).json({message: "Payment made successfully!!", payment})
   
    } catch (error :any) {
        return res.status(500).json({error: "error.message"});
    }
}

//Get all payments
export const getAllPaymentsController = async(req: Request, res: Response) =>{
    try {
        const allPayments = await getAllPaymentsService()
        if (!allPayments || allPayments.length === 0) {
            return res.status(404).json({message : "No Payments Found"})
        }
        return res.status(200).json({data: allPayments})
    } catch (error: any) {
        return res.status(500).json({error: error.message})
    }
}

// get Payment by id controller
export const getPaymentByIdController = async (req: Request, res: Response) => {
    try {
        const id  = parseInt (req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({message: "Invalid ID format"});
        }
        const getPaymentByID = await getPaymentByIDService(id);
        if (!getPaymentByID) {
            return res.status(404).json({message: "Payment not found"});
        }
        return res.status(200).json({data: getPaymentByID});
    } catch (error: any) {
        return res.status(500).json({error: error.message});
    }
}

// get Payment by Event id controller
export const getPaymentByEventIDController = async (req: Request, res: Response) => {
    try {
        const id  = parseInt (req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({message: "Invalid ID format"});
        }
        const getPaymentByID = await getPaymentByEventIDService(id);
        if (!getPaymentByID) {
            return res.status(404).json({message: "Payment not found"});
        }
        return res.status(200).json({data: getPaymentByID});
    } catch (error: any) {
        return res.status(500).json({error: error.message});
    }
}

// get Payment by RSVP id controller
export const getPaymentByRSVPIDController = async (req: Request, res: Response) => {
    try {
        const id  = parseInt (req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({message: "Invalid ID format"});
        }
        const getPaymentByID = await getPaymentByRSVPIDService(id);
        if (!getPaymentByID) {
            return res.status(404).json({message: "Payment not found"});
        }
        return res.status(200).json({data: getPaymentByID});
    } catch (error: any) {
        return res.status(500).json({error: error.message});
    }
}

// delete payment controller
export const deletePaymentController = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({message: "Invalid ID format"});
        }
        
        const deletedMessage = await deletePaymentService(id);
        if (!deletedMessage) {
            return res.status(404).json({message: "Payment not found"});
        }
        return res.status(200).json({message: deletedMessage});
    } catch (error: any) {
        return res.status(500).json({error: error.message});
    }
}
