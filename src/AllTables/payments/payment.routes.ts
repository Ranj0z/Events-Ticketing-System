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

const paymentRoutes = (app: Express) => {
  // start a payment for an RSVP (replaces the old /payment/makePayment)
  app.route("/payments/rsvp/:rsvpId/initiate").post(
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
