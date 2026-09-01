//API

import {
  deletePaymentService,
  getAllPaymentsService,
  getPaymentByEventIDService,
  getPaymentByIDService,
  getPaymentByRSVPIDService,
  getPaymentStatusService,
  initiatePaymentService,
  verifyGatewaySignature,
  handleGatewayWebhookService,
  PaymentAlreadyInitiatedError,
  RsvpNotFoundError,
} from "./payment.service";
import { Request, Response } from "express";

// initiate a payment for an RSVP — replaces the old direct makePaymentController
export const initiatePaymentController = async (req: Request, res: Response) => {
  try {
    const rsvpId = parseInt(req.params.rsvpId);
    const { phoneNumber } = req.body;
    if (isNaN(rsvpId)) return res.status(400).json({ message: "Invalid RSVP ID format" });
    if (!phoneNumber) return res.status(400).json({ message: "phoneNumber is required" });

    const result = await initiatePaymentService({ rsvpId, phoneNumber });
    return res.status(201).json(result);
  } catch (error: any) {
    if (error instanceof RsvpNotFoundError) return res.status(404).json({ message: "RSVP not found" });
    if (error instanceof PaymentAlreadyInitiatedError)
      return res.status(409).json({ message: "A payment is already pending or completed for this RSVP" });
    return res.status(500).json({ error: error.message });
  }
};

// receives the gateway's HMAC-signed webhook — replaces the old raw Daraja callback controller
export const gatewayWebhookController = async (req: Request, res: Response) => {
  try {
    const signature = req.headers["x-signature"] as string | undefined;
    // req.rawBody is captured by the express.json({ verify }) hook in index.ts
    if (!verifyGatewaySignature((req as any).rawBody, signature)) {
      return res.status(401).json({ message: "Invalid signature" });
    }

    await handleGatewayWebhookService(req.body);
    return res.status(200).json({ message: "ok" });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// polled by the frontend — status mapped to pending/success/failed
export const getPaymentStatusController = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.paymentId);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid ID format" });

    const status = await getPaymentStatusService(id);
    if (!status) return res.status(404).json({ message: "Payment not found" });
    return res.status(200).json(status);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

//Get all payments
export const getAllPaymentsController = async (req: Request, res: Response) => {
  try {
    const allPayments = await getAllPaymentsService();
    if (!allPayments || allPayments.length === 0) {
      return res.status(404).json({ message: "No Payments Found" });
    }
    return res.status(200).json({ allPayments: allPayments });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// get Payment by id controller
export const getPaymentByIdController = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid ID format" });

    const getPaymentByID = await getPaymentByIDService(id);
    if (!getPaymentByID) return res.status(404).json({ message: "Payment not found" });
    return res.status(200).json({ data: getPaymentByID });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// get Payment by Event id controller
export const getPaymentByEventIDController = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid ID format" });

    const getPaymentByID = await getPaymentByEventIDService(id);
    if (!getPaymentByID) return res.status(404).json({ message: "Payment not found" });
    return res.status(200).json({ data: getPaymentByID });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// get Payment by RSVP id controller
export const getPaymentByRSVPIDController = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid ID format" });

    const getPaymentByID = await getPaymentByRSVPIDService(id);
    if (!getPaymentByID) return res.status(404).json({ message: "Payment not found" });
    return res.status(200).json({ data: getPaymentByID });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// delete payment controller
export const deletePaymentController = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid ID format" });

    const deletedPayment = await getPaymentByIDService(id);
    if (!deletedPayment) return res.status(404).json({ message: "Payment not found" });

    const delPayment = await deletePaymentService(id);
    if (delPayment.length > 0) {
      return res.status(200).json({ message: "Payment deleted Successfully!!", deletedPayment });
    }

    return res.status(404).json({ message: "Failed to delete Payment!!" });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};
