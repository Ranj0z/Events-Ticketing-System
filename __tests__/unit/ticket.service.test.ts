import {
  createTicketService,
  deleteTicketService,
  getAllTicketsService,
  getTicketByIDService,
  getTicketByUserIDService,
  updateTicketService
} from "../../src/AllTables/tickets/ticket.service";

import db from "../../src/Drizzle/db";

// Mock the db module
jest.mock("../../src/Drizzle/db", () => ({
  __esModule: true,
  default: {
    insert: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    query: {
      UserSupportTicketsTable: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
      },
    },
  },
}));

// Mock data with relationship (ticket + user)
const mockTicket = {
  ticketId: 1,
  userId: 1,
  subject: "Login Issue",
  description: "I can't log into my account.",
  status: "open",
  user: {
    userId: 1,
    firstName: "John",
    lastName: "Doe",
    email: "john@example.com",
  },
};

describe("Customer Support Services", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should create a customer support ticket", async () => {
    (db.insert as jest.Mock).mockReturnValue({
      values: jest.fn().mockReturnValue({
        returning: jest.fn().mockResolvedValue([mockTicket]),
      }),
    });

    const result = await createTicketService(mockTicket as any);
    expect(result).toEqual("Ticket created successfully");
    expect(db.insert).toHaveBeenCalled();
  });

  test("should return all support tickets", async () => {
    (db.query.UserSupportTicketsTable.findMany as jest.Mock).mockResolvedValue([mockTicket]);

    const result = await getAllTicketsService();
    expect(result).toEqual([mockTicket]);
    expect(db.query.UserSupportTicketsTable.findMany).toHaveBeenCalled();
  });

  test("should return support ticket by User ID with user details", async () => {
    (db.query.UserSupportTicketsTable.findFirst as jest.Mock).mockResolvedValue(mockTicket);

    const result = await getTicketByUserIDService(1);
    expect(result).toEqual(mockTicket);
  });

    test("should return support ticket by ID", async () => {
    (db.query.UserSupportTicketsTable.findFirst as jest.Mock).mockResolvedValue(mockTicket);

    const result = await getTicketByIDService(1);
    expect(result).toEqual(mockTicket);
  });

  test("should update support ticket by ID", async () => {
  (db.update as jest.Mock).mockReturnValue({
    set: jest.fn().mockReturnValue({
      where: jest.fn().mockReturnValue({
        returning: jest.fn().mockResolvedValue([mockTicket]),
      }),
    }),
  });

  const result = await updateTicketService(1, mockTicket as any);

  expect(result).toEqual("Ticket updated successfully ✅");
  expect(db.update).toHaveBeenCalled();
});

  test("should delete support ticket by ID", async () => {
    (db.delete as jest.Mock).mockReturnValue({
      where: jest.fn().mockReturnValue({
        returning: jest.fn().mockResolvedValue([mockTicket]),
      }),
    });

    const result = await deleteTicketService(1);
    expect(result).toBe("Ticket deleted Successfully!!");
  });

  test("should return 'Ticket deleting failed' on failed delete", async () => {
    (db.delete as jest.Mock).mockReturnValue({
      where: jest.fn().mockReturnValue({
        returning: jest.fn().mockResolvedValue([]),
      }),
    });

    const result = await deleteTicketService(999);
    expect(result).toBe("Ticket deleting failed");
  });
});