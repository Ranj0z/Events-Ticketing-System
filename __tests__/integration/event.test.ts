/**
 * Event + Venue full‑stack integration tests
 *
 * Assumes these routes exist (per EventRoutes):
 *   POST   /venue                       – create venue
 *   POST   /event/newevent              – create event
 *   GET    /event/allevents             – list events
 *   GET    /event/:id                   – get by eventId
 *   GET    /event/venue/:id             – get by venueId
 *   PUT    /event/update/:id            – update by eventId
 *   DELETE /event/delete/:id            – delete by eventId
 *   DELETE /venue/:id                   – delete venue
 */

import request from "supertest";
import app from "../../src/index";
import db from "../../src/Drizzle/db";

import { eq } from "drizzle-orm";

let eventId: number;
let venueId: number = 12;

  const testVenue = {
    venueName: "Test Arena456",
    address: "101",
    capacity: 5000,
    createdAt: new Date().toISOString().split("T")[0]
  };

   
  const testEvent = {
    title: "Christmass carols",
    description: "An amazing night of performances",
    VenueID: venueId,
    category: "Tech",
    date: "2025-08-10",
    time: "10:00 AM",
    ticketsPrice: "2000.00",
    totalTickets: 300,
    soldTickets: 180,
    createdAt: new Date().toISOString().split("T")[0]
  }
  
describe("Positive Event Integration Tests", () => {
  beforeAll(async () => {
     const res = await request(app)
    .post("/venue/newVenue ")
    .send(testVenue);
    venueId = res.body.venue?.VenueID;
  });

    // CREATE event
it("should create a new event", async () => {
  const res = await request(app)
    .post("/event/newevent ")
    .send(testEvent);

    // ✅ Extract eventId directly from the response
    eventId = res.body.newEvent?.EventID;


  expect(res.status).toBe(201);
  expect(res.body.message).toBe("New Event Created!!");
  expect(eventId).toBeDefined(); // sanity check

});


  it("should fetch all events", async () => {
    const res = await request(app)
    .get("/event/allevents");

    expect(res.status).toBe(200);
    expect(res.body.Events.length).toBeGreaterThan(0);
  });

   it("should get event by ID", async () => {
    const res = await request(app)
    .get(`/event/${eventId}`);

    expect(res.status).toBe(200);
    expect(res.body.event).toHaveProperty("EventID", eventId);
    expect(res.body.event).toHaveProperty("VenueID", );
  });

  it("should get event by Venue ID", async () => {
    const res = await request(app)
    .get(`/event/venue/9`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty("EventID");
    expect(res.body.data).toHaveProperty("VenueID");
  });

  it("should update the event", async () => {
  const updatedEvent = { title: "Updated Concert Night", description: "Now with more artists!" };

  const res = await request(app)
    .patch(`/event/update/${eventId}`)
    .send(updatedEvent);

  expect(res.status).toBe(200);
  expect(res.body.message).toBe("Event updated successfully ✅");
});

  it("should delete the event", async () => {
    const res = await request(app)
    .delete(`/event/delete/${eventId}`);
    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Event deleted Successfully!!");
  });


  afterAll(async () => {
    await request(app)
    .delete(`/venue/delete/${venueId}`);
  });
});


describe("Negative Event Integration Tests", () => {
    beforeAll(async () => {
     const res = await request(app)
    .post("/venue/newVenue ")
    .send(testVenue);
    venueId = res.body.venue?.VenueID;
  });

  it("should fail to get and 'return 404' for non-existent event", async () => {
    const res = await request(app)
    .get(`/event/200`);
    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Event not found");
  });
  
  it("should fail to get and 'return 400' for Invalid ID format", async () => {
    const res = await request(app)
    .get(`/event/$'{eventId}`);
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Invalid ID format");
  });

  it("should fail to getEventByVenueID and 'return 404' for non-existent event", async () => {
    const res = await request(app)
    .get(`/event/venue/200`);
    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Event not found");
  });
  
  it("should fail to getEventByVenueID and 'return 400' for Invalid ID format", async () => {
    const res = await request(app)
    .get(`/event/venue/$'{eventId}`);
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Invalid ID format");
  });

  it("should fail to Update and 'return 404' for non-existent event", async () => {
    const res = await request(app)
    .patch(`/event/update/200`);
    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Event not found");
  });
  
  it("should fail to Update and 'return 400' for Invalid ID format", async () => {
    const res = await request(app)
    .patch(`/event/update/$'{eventId}`);
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Invalid ID format");
  });
  
  it("should fail to delete and 'return 404' for non-existent event", async () => {
    const res = await request(app)
    .delete(`/event/delete/200`);
    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Event not found !!!  Failed to delete");
  });  

  it("should fail to delete and 'return 400' for Invalid ID format", async () => {
    const res = await request(app)
    .delete(`/event/delete/$'{eventId}`);
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Invalid ID format");
  });

    afterAll(async () => {
    await request(app)
    .delete(`/venue/delete/${venueId}`);
  });
});