import { Express } from "express";
import {
  deletePaymentController,
  getAllPaymentsController,
  getPaymentByEventIDController,
  getPaymentByIdController,
  getPaymentByRSVPIDController,
  initiatePaymentController,
  initiateInstallmentPaymentController,
  gatewayWebhookController,
  getPaymentStatusController,
  sweepExpiredHoldsController,
} from "./payment.controller";
import { adminRoleAuth, allRoleAuth, requireOwnerOrAdmin } from "../../middleware/tokensAuth";
import { getPaymentByRSVPIDService } from "./payment.service";

const paymentOwnerResolver = async (req: any) => {
  const payment = await getPaymentByRSVPIDService(parseInt(req.params.id));
  return payment?.UserID ?? null;
}

const paymentRoutes = (app: Express) => {
  app.route("/payments/:paymentId/initiate").post(
    async (req, res, next) => {
      try {
        await initiatePaymentController(req, res);
      } catch (error) {
        next(error);
      }
    }
  );

  // Partial-payments plan §4 — one installment (one STK push) against a specific RSVP.
  app.route("/payments/rsvp/:rsvpId/initiate-installment").post(
    async (req, res, next) => {
      try {
        await initiateInstallmentPaymentController(req, res);
      } catch (error) {
        next(error);
      }
    }
  );

  app.route("/payments/gateway-webhook").post(
    async (req, res, next) => {
      try {
        await gatewayWebhookController(req, res);
      } catch (error) {
        next(error);
      }
    }
  );

  app.route("/payments/:paymentId/status").get(
    async (req, res, next) => {
      try {
        await getPaymentStatusController(req, res);
      } catch (error) {
        next(error);
      }
    }
  );

  app.route("/payments/sweep-expired-holds").post(
    adminRoleAuth,
    async (req, res, next) => {
      try {
        await sweepExpiredHoldsController(req, res);
      } catch (error) {
        next(error);
      }
    }
  );

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