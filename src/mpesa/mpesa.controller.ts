import { Request, Response, RequestHandler } from "express";
import { initiateStkPush, handleMpesaCallback } from "./mpesa.service";

// STK Push Controller
export const stkPushController: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { phoneNumber, amount, PaymentID } = req.body;

    if (!phoneNumber || !amount || !PaymentID) {
      res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
      return;
    }

    const data = await initiateStkPush({
      phoneNumber,
      amount: Number(amount),
      PaymentID: Number(PaymentID),
    });

    res.json({ success: true, data });
  } catch (error) {
    console.error("STK Push Error:", (error as Error).message);
    res.status(500).json({ success: false, message: "STK push failed" });
  }
};

export const mpesaCallbackController: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const PaymentIDParam = req.query.payment_id;
    const PaymentID = Number(PaymentIDParam);

    if (isNaN(PaymentID)) {
      res.status(400).json({ message: "Invalid or missing payment_id" });
      return;
    }

    await handleMpesaCallback(PaymentID, req.body);

    res.status(200).json({ message: "Callback processed successfully" });
  } catch (error) {
    console.error("Callback Error:", (error as Error).message);
    res.status(500).json({ message: "Failed to handle callback" });
  }
};
