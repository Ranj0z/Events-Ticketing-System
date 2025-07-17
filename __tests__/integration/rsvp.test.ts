import request from "supertest";
import app from "../../src/index";
import db from "../../src/Drizzle/db";

let rsvpId : number;
let eventId: number;
let userId: number;

  const testRSVP = {
    UserID: 5,
    EventID: 4,
    RSVPDate: new Date("2025-07-04").toISOString(),
    RSVPStatus: "Pending",
    totalAmount: "3000.00"
  };

describe("reservation Integration Tests", () => {
      it("should create a new reservation", async () => {    
    const res = await request(app)
      .post("/reservation/newRsvp")
      .send(testRSVP);
      
      rsvpId = res.body.RSVP[0]?.RSVPID;
      eventId = res.body.RSVP[0]?.EventID;
      userId = res.body.RSVP[0]?.UserID;

    expect(res.status).toBe(201);
    expect(res.body.message).toBe("New RSVP Created!!");
  expect(rsvpId).toBeDefined(); // sanity check

  });

  it("should fetch all reservations", async () => {
    const res = await request(app)
    .get("/reservation/allRsvps");

    expect(res.status).toBe(200);
    expect(res.body.reservations.length).toBeGreaterThan(0);
  });

  it("should get reservation by ID", async () => {
    const res = await request(app)
    .get(`/reservation/${rsvpId}`);

    expect(res.status).toBe(200);
    expect(res.body.reservation).toHaveProperty("RSVPID");
    expect(res.body.reservation).toHaveProperty("EventID");
  });

  it("should get reservation by EventID", async () => {
    const res = await request(app)
    .get(`/reservation/event/${eventId}`);

    expect(res.status).toBe(200);
    expect(res.body.reservation).toHaveProperty("RSVPID");
    expect(res.body.reservation).toHaveProperty("EventID");
  });

  it("should get reservation by UserID", async () => {
    const res = await request(app)
    .get(`/reservation/${userId}`);

    expect(res.status).toBe(200);
    expect(res.body.reservation).toHaveProperty("RSVPID");
    expect(res.body.reservation).toHaveProperty("EventID");
  });

  it("should update the reservation", async () => {
    const updatedreservation = { RSVPStatus: "Cancelled" };
    const res = await request(app)
    .patch(`/reservation/update/${rsvpId}`)
    .send(updatedreservation);

    expect(res.status).toBe(200);
    expect(res.body.message)
    .toBe("Reservation updated successfully ✅");
  });

  it("should delete the reservation", async () => {
    const res = await request(app)
    .delete(`/reservation/delete/${rsvpId}`);

    expect(res.status).toBe(200);
    expect(res.body.message)
    .toBe("Reservation deleted Successfully!!");
  });
});


describe("Negative Event Integration Tests", () => {

  it("should fail to get and 'return 404' for non-existent RSVP", async () => {
    const res = await request(app)
    .get(`/reservation/200`);
    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Reservation not found");
  });
  
  it("should fail to get and 'return 400' for Invalid ID format", async () => {
    const res = await request(app)
    .get(`/reservation/$'{rsvpId}`);
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Invalid ID format");
  });

  it("should fail to getReservationByEventID and 'return 404' for non-existent RSVP", async () => {
    const res = await request(app)
    .get(`/reservation/event/200`);
    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Reservation not found");
  });
  
  it("should fail to getReservationByEventID and 'return 400' for Invalid ID format", async () => {
    const res = await request(app)
    .get(`/reservation/event/$'{rsvpId}`);
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Invalid ID format");
  });

  it("should fail to getReservationByUserID and 'return 404' for non-existent RSVP", async () => {
    const res = await request(app)
    .get(`/reservation/user/200`);
    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Reservation not found");
  });
  
  it("should fail to getReservationByUserID and 'return 400' for Invalid ID format", async () => {
    const res = await request(app)
    .get(`/reservation/user/$'{rsvpId}`);
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Invalid ID format");
  });

  it("should fail to Update and 'return 404' for non-existent RSVP", async () => {
    const res = await request(app)
    .patch(`/reservation/update/200`);
    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Reservation not found!!");
  });
  
  it("should fail to Update and 'return 400' for Invalid ID format", async () => {
    const res = await request(app)
    .patch(`/reservation/update/$'{rsvpId}`);
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Invalid ID format");
  });
  
  it("should fail to delete and 'return 404' for non-existent RSVP", async () => {
    const res = await request(app)
    .delete(`/reservation/delete/200`);
    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Reservation not found !!!  Failed to delete");
  });  

  it("should fail to delete and 'return 400' for Invalid ID format", async () => {
    const res = await request(app)
    .delete(`/reservation/delete/$'{rsvpId}`);
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Invalid ID format");
  });
});