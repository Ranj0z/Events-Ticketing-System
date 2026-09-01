import axios from "axios";

// Eventor never talks to Daraja directly — everything goes through the
// shared Paybill Gateway. See PAYBILL_GATEWAY_ARCHITECTURE.md /
// APP_INTEGRATION_CONTRACT.md.

type StkPushResult = {
  CheckoutRequestID: string;
  MerchantRequestID: string;
};

export const initiateGatewayStkPush = async ({
  phone,
  amount,
  orderRef,
  description,
}: {
  phone: string;
  amount: number;
  orderRef: string;
  description?: string;
}): Promise<StkPushResult> => {
  // Gateway derives app_code from the API key and builds
  // AccountReference = {app_code}-{order_ref} itself — never send it here.
  const { data } = await axios.post(
    `${process.env.GATEWAY_BASE_URL}/gateway/stkpush`,
    {
      phone,
      amount,
      order_ref: orderRef,
      description: description ?? "Eventor ticket payment",
    },
    { headers: { "X-API-Key": process.env.GATEWAY_API_KEY! } }
  );

  return data;
};
