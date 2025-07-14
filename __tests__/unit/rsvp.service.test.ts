import {
  createReservationService,
  deleteReservationService,
  getAllReservationsService,
  getReservationByEventIDService,
  getReservationByRSVPIDService,
  getReservationByUserIDService,
  updateReservationService,
} from "../../src/AllTables/rsvp/reservation.service";

import db from "../../src/Drizzle/db";

// Mock the db module and its structure
jest.mock("../../src/Drizzle/db", () => ({
  __esModule: true,
  default: {
    insert: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    query: {
      RSVPTable: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
      },
    },
  },
}));

// Sample mock Reservation with relationship data
const mockReservation = {
  ReservationId: 1,
  userId: 1,
  eventId: 1,
  quantity: 2,
  totalAmount: 1000,
  ReservationStatus: "confirmed",
  user: {
    userId: 1,
    firstName: "John",
    lastName: "Doe",
  },
  event: {
    eventId: 1,
    eventName: "Mock Festival",
  },
};

describe("Reservation Services", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should create a new Reservation", async () => {
    (db.insert as jest.Mock).mockReturnValue({
      values: jest.fn().mockReturnValue({
        returning: jest.fn().mockResolvedValue([mockReservation]),
      }),
    });

    const result = await createReservationService(mockReservation as any);
    expect(result).toEqual("Reservation created successfully");
    expect(db.insert).toHaveBeenCalled();
  });

  test("should return all Reservations", async () => {
    (db.query.RSVPTable.findMany as jest.Mock).mockResolvedValue([mockReservation]);

    const result = await getAllReservationsService();
    expect(result).toEqual([mockReservation]);
    expect(db.query.RSVPTable.findMany).toHaveBeenCalled();
  });


  test("should return Reservation by ID", async () => {
    (db.query.RSVPTable.findFirst as jest.Mock).mockResolvedValue(mockReservation);

    const result = await getReservationByRSVPIDService(1);
    expect(result).toEqual(mockReservation);
    expect(db.query.RSVPTable.findFirst).toHaveBeenCalled();
  });

  test("should return Reservation by EventID", async () => {
    (db.query.RSVPTable.findFirst as jest.Mock).mockResolvedValue([mockReservation]);

    const result = await getReservationByEventIDService(1);
    expect(result).toEqual([mockReservation]);
    expect(db.query.RSVPTable.findFirst).toHaveBeenCalled();
  });

  test("should return Reservation by UserID", async () => {
    (db.query.RSVPTable.findFirst as jest.Mock).mockResolvedValue([mockReservation]);

    const result = await getReservationByUserIDService(1);
    expect(result).toEqual([mockReservation]);
    expect(db.query.RSVPTable.findFirst).toHaveBeenCalled();
  });

  test("should update a Reservation by ID", async () => {
    (db.update as jest.Mock).mockReturnValue({
      set: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([mockReservation]),
        }),
      }),
    });

    const result = await updateReservationService(1, mockReservation as any);
    expect(result).toBe("RSVP updated successfully ✅");
    expect(db.update).toHaveBeenCalled();
  });

  test("should delete a Reservation by ID", async () => {
    (db.delete as jest.Mock).mockReturnValue({
      where: jest.fn().mockReturnValue({
        returning: jest.fn().mockResolvedValue([mockReservation]),
      }),
    });

    const result = await deleteReservationService(1);
    expect(result).toBe("Reservation deleted Successfully!!");
    expect(db.delete).toHaveBeenCalled();
  });

  test("should return 'Reservation not deleted!!' on failed delete", async () => {
    (db.delete as jest.Mock).mockReturnValue({
      where: jest.fn().mockReturnValue({
        returning: jest.fn().mockResolvedValue([]),
      }),
    });

    const result = await deleteReservationService(999);
    expect(result).toBe("Reservation not deleted!!");
  });
});