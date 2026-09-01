import {
  getAllPaymentsService,
  deletePaymentService,
  getPaymentByIDService,
  getPaymentByEventIDService,
  getPaymentByRSVPIDService,
  getPaymentStatusService,
} from "../../src/AllTables/payments/payment.service";

import db from "../../src/Drizzle/db";

// Mock the db module
jest.mock("../../src/Drizzle/db", () => ({
  __esModule: true,
  default: {
    insert: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    query: {
      PaymentTable: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
      },
      RSVPTable: {
        findFirst: jest.fn(),
      },
    },
  },
}));

// Sample payment matching the current PaymentTable shape
const mockPayment = {
  PaymentID: 1,
  RSVPID: 1,
  EventID: 1,
  amount: "4000.00",
  paymentStatus: "Completed",
  TransactionID: "MP001001001",
};

describe("Payment Services", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // NOTE: initiatePaymentService and handleGatewayWebhookService call out to
  // the paybill gateway (axios) and are not covered here yet — they need
  // axios + lib/paybillGateway mocked. Flagged in the cleanup plan (step 9),
  // not done as part of this pass.

  test("should map paymentStatus to the frontend's status vocabulary", async () => {
    (db.query.PaymentTable.findFirst as jest.Mock).mockResolvedValue(mockPayment);

    const result = await getPaymentStatusService(1);
    expect(result).toEqual({ status: "success" });
  });

  test("should return payment by ID", async () => {
    (db.query.PaymentTable.findFirst as jest.Mock).mockResolvedValue(mockPayment);

    const result = await getPaymentByIDService(1);
    expect(result).toEqual(mockPayment);
  });

  test("should return payment by Event ID ", async () => {
    (db.query.PaymentTable.findFirst as jest.Mock).mockResolvedValue(mockPayment);

    const result = await getPaymentByEventIDService(1);
    expect(result).toEqual(mockPayment);
  });

    test("should return payment by RSVP ID ", async () => {
    (db.query.PaymentTable.findFirst as jest.Mock).mockResolvedValue(mockPayment);

    const result = await getPaymentByRSVPIDService(1);
    expect(result).toEqual(mockPayment);
  });

  test("should delete a payment by ID", async () => {
    (db.delete as jest.Mock).mockReturnValue({
      where: jest.fn().mockReturnValue({
        returning: jest.fn().mockResolvedValue([mockPayment]),
      }),
    });

    const result = await deletePaymentService(1);
    expect(result).toEqual([mockPayment]);
  });

  test("should return [] when nothing matched the delete", async () => {
    (db.delete as jest.Mock).mockReturnValue({
      where: jest.fn().mockReturnValue({
        returning: jest.fn().mockResolvedValue([]),
      }),
    });

    const result = await deletePaymentService(999);
    expect(result).toEqual([]);
  });
});