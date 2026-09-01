import {
  createEventService,
  getAllEventsService,
  deleteEventService,
  getEventByIDService,
  updateEventService
} from "../../src/AllTables/events/events.service"; // Adjust path as needed

import db from "../../src/Drizzle/db";

// Mock the database module
jest.mock("../../src/Drizzle/db", () => ({
  __esModule: true,
  default: {
    insert: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    query: {
      EventTable: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
      },
    },
  },
}));

const mockVenue = {
  venueId: 1,
  venueName: "Mock Venue",
  address: 123,
  capacity: 1000,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockEvent = {
  eventId: 1,
  eventName: "Mock Festival",
  venueId: 1,
  category: "Music",
  eventDate: new Date(),
  startTime: "18:00:00",
  endTime: "23:00:00",
  description: "A great event",
  ticketPrice: 500,
  ticketsTotal: 100,
  ticketsAvailable: 80,
  ticketsSold: 20,
  isActive: true,
  imageUrl: "http://example.com/image.jpg",
  createdAt: new Date(),
  updatedAt: new Date(),
  venue: mockVenue, 
};

describe("Event Services", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should create a new event", async () => {
    (db.insert as jest.Mock).mockReturnValue({
      values: jest.fn().mockReturnValue({
        returning: jest.fn().mockResolvedValue([mockEvent]),
      }),
    });

    const result = await createEventService(mockEvent as any);
    expect(result).toEqual("Event created successfully");
    expect(db.insert).toHaveBeenCalled();
  });

  test("should update event by ID", async () => {
    (db.update as jest.Mock).mockReturnValue({
      set: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([mockEvent]),
        }),
      }),
    });

    const result = await updateEventService(1, mockEvent as any);
    expect(result).toBe("Event updated successfully ✅");
  });

  test("should delete event by ID", async () => {
    (db.delete as jest.Mock).mockReturnValue({
      where: jest.fn().mockReturnValue({
        returning: jest.fn().mockResolvedValue([mockEvent]),
      }),
    });

    const result = await deleteEventService(1);
    expect(result).toBe("Event deleted Successfully!!");
  });

  test("should return 'Event deleting failed' if delete fails", async () => {
    (db.delete as jest.Mock).mockReturnValue({
      where: jest.fn().mockReturnValue({
        returning: jest.fn().mockResolvedValue([]),
      }),
    });

    const result = await deleteEventService(999);
    expect(result).toBe("Event deleting failed");
  });
});