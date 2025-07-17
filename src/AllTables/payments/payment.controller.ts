//API

import { deletePaymentService, getAllPaymentsService, getPaymentByEventIDService, getPaymentByIDService, getPaymentByRSVPIDService, makePaymentService } from "./payment.service";
import { Request, Response } from "express";

//make payment controller

export const makePaymentController = async( req: Request, res: Response) =>{
    try {
        const payment = req.body;

        const newPayment = await makePaymentService(payment)
        if (!newPayment) {
            return res.json({message: "Payment not successfull"})
        }
        return res.status(201).json({message: "Payment made successfully!!", newPayment: newPayment})
       } catch (error :any) {
        return res.status(500).json({error: error.message});
    }
}

//Get all payments
export const getAllPaymentsController = async(req: Request, res: Response) =>{
    try {
        const allPayments = await getAllPaymentsService()
        if (!allPayments || allPayments.length === 0) {
            return res.status(404).json({message : "No Payments Found"})
        }
        return res.status(200).json({allPayments: allPayments})
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
        
        const deletedPayment = await getPaymentByIDService(id);
        if (!deletedPayment) {
            return res.status(404).json({message: "Payment not found"});
        }

        const delPayment = await deletePaymentService(id);
        if (delPayment.length >0) {
        return res.status(200).json({message: "Payment deleted Successfully!!", deletedPayment});
        }

        return res.status(404).json({message: "Failed to delete Payment!!"});
    } catch (error: any) {
        return res.status(500).json({error: error.message});
    }
}
