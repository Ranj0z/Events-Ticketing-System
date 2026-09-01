import {
  createVenueService,
  deleteVenueService,
  getAllVenuesService,
  getVenueByIDService,
  updateVenueService,
} from "../../src/AllTables/venues/venue.service"; // Adjust the path as needed

import db from "../../src/Drizzle/db";
import { TIVenues, VenuesTable } from "../../src/Drizzle/schema";

// Mock the entire db module
jest.mock("../../src/Drizzle/db", () => ({
  __esModule: true,
  default: {
    insert: jest.fn(),
    query: {
      VenuesTable: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
      },
    },
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

const mockVenue = {
  venueName: "Test Hall",
  address: 12345,
  capacity: 300
//   createdAt: new Date(),
//   updatedAt: new Date(),
};

describe("Venue Services", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should create a new venue", async () => {
    (db.insert as jest.Mock).mockReturnValue({
      values: jest.fn().mockReturnValue({
        returning: jest.fn().mockResolvedValue([mockVenue]),
      }),
    });

    const result = await createVenueService(mockVenue as any);
    expect(result).toEqual("Venue created successfully");
    expect(db.insert).toHaveBeenCalled();
  });

  test("should return all venues if available", async () => {
    (db.query.VenuesTable.findMany as jest.Mock).mockResolvedValue([mockVenue]);

    const venues = await getAllVenuesService();
    expect(venues).toEqual([mockVenue]);
    expect(db.query.VenuesTable.findMany).toHaveBeenCalled();
  });

  test("should get venue by ID", async () => {
    (db.query.VenuesTable.findFirst as jest.Mock).mockResolvedValue(mockVenue);

    const result = await getVenueByIDService(1);
    expect(result).toEqual(mockVenue);
    expect(db.query.VenuesTable.findFirst).toHaveBeenCalled();
  });

  test("should update venue by ID", async () => {
    (db.update as jest.Mock).mockReturnValue({
      set: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([mockVenue]),
        }),
      }),
    });

    const result = await updateVenueService(1, mockVenue as any);
    expect(result).toBe("Venue updated successfully ✅");
    expect(db.update).toHaveBeenCalled();
  });

  test("should delete venue by ID", async () => {
    (db.delete as jest.Mock).mockReturnValue({
      where: jest.fn().mockReturnValue({
        returning: jest.fn().mockResolvedValue([mockVenue]),
      }),
    });

    const result = await deleteVenueService(1);
    expect(result).toBe("Venue deleted Successfully!!");
  });

  test("should return 'Venue deleting failed' on failed delete", async () => {
    (db.delete as jest.Mock).mockReturnValue({
      where: jest.fn().mockReturnValue({
        returning: jest.fn().mockResolvedValue([]),
      }),
    });

    const result = await deleteVenueService(999);
    expect(result).toBe("Venue deleting failed");
  });
});