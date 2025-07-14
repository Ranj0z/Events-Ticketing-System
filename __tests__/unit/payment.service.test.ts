import {
  getAllPaymentsService,
  deletePaymentService,
  makePaymentService,
  getPaymentByIDService,
  getPaymentByEventIDService,
  getPaymentByRSVPIDService,
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
    },
  },
}));

// Sample payment with user and booking relation
const mockPayment = {
  paymentId: 1,
  bookingId: 1,
  userId: 1,
  transactionId: 10001,
  amount: 4000,
  paymentStatus: "completed",
  paymentMethod: "m_pesa",
  user: {
    userId: 1,
    firstName: "David",
    lastName: "Mwangi",
  },
  booking: {
    bookingId: 1,
    eventId: 1,
    quantity: 2,
    totalAmount: 4000,
  },
};

describe("Payment Services", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should make a new payment", async () => {
    (db.insert as jest.Mock).mockReturnValue({
      values: jest.fn().mockReturnValue({
        returning: jest.fn().mockResolvedValue([mockPayment]),
      }),
    });

    const result = await makePaymentService(mockPayment as any);
    expect(result).toEqual("Payment made sucessfully");
    expect(db.insert).toHaveBeenCalled();
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
    expect(result).toBe("Payment deleted Successfully!!");
  });

  test("should return 'Failed to delete Payment!!' on failed delete", async () => {
    (db.delete as jest.Mock).mockReturnValue({
      where: jest.fn().mockReturnValue({
        returning: jest.fn().mockResolvedValue([]),
      }),
    });

    const result = await deletePaymentService(999);
    expect(result).toBe("Failed to delete Payment!!");
  });
});