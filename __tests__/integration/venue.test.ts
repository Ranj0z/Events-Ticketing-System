import request from "supertest";
import app from "../../src/index"; // Adjust path to your Express app
import db from "../../src/Drizzle/db";
import { VenuesTable } from "../../src/Drizzle/schema";
import { eq } from "drizzle-orm";

describe("Venue Integration Tests", () => {
  let venueId: number;

  // //Venues Table
  // export const VenuesTable = pgTable("venue", {
  //     VenueID: serial("VenueID").primaryKey(),
  //     venueName: varchar("venue_name", { length: 100 }).notNull(),
  //     address: varchar("address", { length: 255 }).notNull(),
  //     capacity: integer("capacity"),
  //     createdAt: date("created_at", ),
  // })

  /**
 * venue + Venue full‑stack integration tests
 *
 * Assumes these routes exist (per venueRoutes):
 *   POST   /venue/newVenue              – create venue
 *   GET    /venue/allVenues             – list Venues
 *   GET    /venue/:id                   – get by venueId
 *   PUT    /venue/update/:id            – update by venueId
 *   DELETE /venue/delete/:id            – delete by venueId
 */

  const testVenue = {
    venueName: "Test Arena456",
    address: "101",
    capacity: 5000,
    createdAt: new Date().toISOString().split("T")[0]
    };

  // CREATE venue
it("should create a new venue", async () => {
  const res = await request(app)
    .post("/venue/newVenue ")
    .send(testVenue);

    // ✅ Extract venueId directly from the response
    venueId = res.body.venue?.VenueID;


  expect(res.status).toBe(201);
  expect(res.body.message).toBe("New Venue Created!!");
  expect(venueId).toBeDefined(); // sanity check

});


  // GET all Venues
  it("should retrieve all Venues", async () => {
    const res = await request(app).get("/venue/allVenues");

    expect(res.status).toBe(200);
    expect(res.body.Venues.length).toBeGreaterThan(0);
  });


  // GET venue by ID
  it("should get a venue by ID", async () => {
    const res = await request(app)
    .get(`/venue/${venueId}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty("createdAt");
  });


// Fail to return a non existent venue
  it("should return 404 for non-existent venue", async () => {
    const res = await request(app).get(`/venue/20000`);

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Venue not found!!");
  });


  // UPDATE venue
  it("should update the venue", async () => {
    const updatedVenue = {
      venueName: "Updated Arena",
      address: "202",
      capacity: 6000,
    };

    const res = await request(app)
      .patch(`/venue/update/${venueId}`)
      .send(updatedVenue);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Venue updated successfully ✅");
  });


  // DELETE venue
  it("should delete the venue", async () => {
    const res = await request(app)
    .delete(`/venue/delete/${venueId}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Venue deleted Successfully!!");
  });

// Fail to delete a non existent venue
  it("should fail to delete non-existent venue", async () => {
    const res = await request(app).delete(`/venue/delete/20000`);

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Venue not found!!!! Failed to delete");
  });

  

});