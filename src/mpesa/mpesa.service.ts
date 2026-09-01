import axios from "axios";
import db from "../Drizzle/db";
import { eq } from "drizzle-orm";
import { getAccessToken, generatePassword } from "../utils/mpesa.helpers";
import { normalizePhoneNumber } from "../utils/normalizePhoneNumber";
import { PaymentTable } from "../Drizzle/schema";

export const initiateStkPush = async ({
  phoneNumber,
  amount,
  PaymentID,
}: {
  phoneNumber: string;
  amount: number;
  PaymentID: number;
}) => {
  const normalizedPhone = normalizePhoneNumber(phoneNumber); // 🔥 Normalize here

  const token = await getAccessToken();
  const { password, timestamp } = generatePassword();

  const response = await axios.post(
    `https://${
      process.env.MPESA_ENV === "sandbox" ? "sandbox" : "api"
    }.safaricom.co.ke/mpesa/stkpush/v1/processrequest`,
    {
      BusinessShortCode: process.env.MPESA_SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: amount,
      PartyA: normalizedPhone,
      PartyB: process.env.MPESA_SHORTCODE,
      PhoneNumber: normalizedPhone,
      CallBackURL: `${process.env.MPESA_CALLBACK_URL}?payment_id=${PaymentID}`,
      AccountReference: "EventBooking",
      TransactionDesc: "Ticket Payment",
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

export const handleMpesaCallback = async (
  PaymentID: number,
  callbackBody: any
) => {
  const stkCallback = callbackBody.Body?.stkCallback;

  if (!stkCallback || stkCallback.ResultCode !== 0) return;

  const mpesaReceipt = stkCallback.CallbackMetadata?.Item.find(
    (item: any) => item.Name === "MpesaReceiptNumber"
  )?.Value;

  await db
    .update(PaymentTable)
    .set({
      paymentStatus: "Completed",
      TransactionID: mpesaReceipt,
      updated_at: new Date().toISOString(),
    })
    .where(eq(PaymentTable.PaymentID, PaymentID));
};
