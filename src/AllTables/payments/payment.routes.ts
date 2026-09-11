//routing
import { Express } from "express";
import {
  deletePaymentController,
  getAllPaymentsController,
  getPaymentByEventIDController,
  getPaymentByIdController,
  getPaymentByRSVPIDController,
  initiatePaymentController,
  gatewayWebhookController,
  getPaymentStatusController,
} from "./payment.controller";
import { adminRoleAuth, allRoleAuth, requireOwnerOrAdmin } from "../../middleware/tokensAuth";
import { getPaymentByRSVPIDService } from "./payment.service";

// PaymentTable now carries its own UserID (the buyer) — a buyer can pay for
// RSVPs belonging to other users/guests, so ownership is checked against the
// Payment row's UserID rather than the RSVP's UserID. This resolver guards
// GET /payment/rsvp/:id, whose :id is an RSVPID, so it hops RSVP -> Payment.
const paymentOwnerResolver = async (req: any) => {
  const payment = await getPaymentByRSVPIDService(parseInt(req.params.id));
  return payment?.UserID ?? null;
}

const paymentRoutes = (app: Express) => {
  // start a payment (replaces the old /payment/makePayment). Keyed by
  // PaymentID, not RSVPID — one Payment covers a whole cart of RSVPs.
  // Stays open to guest checkout — no auth gate.
  app.route("/payments/:paymentId/initiate").post(
    async (req, res, next) => {
      try {
        await initiatePaymentController(req, res);
      } catch (error) {
        next(error);
      }
    }
  );

  // gateway's HMAC-signed webhook (replaces the old /api/mpesa/callback)
  app.route("/payments/gateway-webhook").post(
    async (req, res, next) => {
      try {
        await gatewayWebhookController(req, res);
      } catch (error) {
        next(error);
      }
    }
  );

  // polled by the frontend PaymentModal
  app.route("/payments/:paymentId/status").get(
    async (req, res, next) => {
      try {
        await getPaymentStatusController(req, res);
      } catch (error) {
        next(error);
      }
    }
  );

  //Get all payments
  app.route("/payment/allPayment").get(
    adminRoleAuth,
    async (req, res, next) => {
      try {
        await getAllPaymentsController(req, res);
      } catch (error) {
        next(error);
      }
    }
  );

  //get Payment by ID
  app.route("/payment/:id").get(
    adminRoleAuth,
    async (req, res, next) => {
      try {
        await getPaymentByIdController(req, res);
      } catch (error: any) {
        next(error);
      }
    }
  );

  //Get Payment by eventID
  app.route("/payment/event/:id").get(
    adminRoleAuth,
    async (req, res, next) => {
      try {
        await getPaymentByEventIDController(req, res);
      } catch (error: any) {
        next(error);
      }
    }
  );

  //Get Payment by rsvpID
  app.route("/payment/rsvp/:id").get(
    allRoleAuth,
    requireOwnerOrAdmin(paymentOwnerResolver),
    async (req, res, next) => {
      try {
        await getPaymentByRSVPIDController(req, res);
      } catch (error: any) {
        next(error);
      }
    }
  );

  //Delete Payment by ID
  app.route("/payment/delete/:id").delete(
    adminRoleAuth,
    async (req, res, next) => {
      try {
        await deletePaymentController(req, res);
      } catch (error: any) {
        next(error);
      }
    }
  );
};

export default paymentRoutes;