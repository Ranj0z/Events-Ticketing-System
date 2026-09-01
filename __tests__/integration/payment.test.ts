import request from "supertest";
import app from "../../src/index";

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

// NOTE: the old "create a new payment" test posted directly to the removed
// /payment/makePayment endpoint. Payments are now created via
// POST /payments/rsvp/:rsvpId/initiate, which calls out to the live paybill
// gateway (axios) — needs that call mocked to test in isolation. Flagged in
// the cleanup plan (step 9), not done as part of this pass. The remaining
// CRUD tests below (get/delete by id) are read/delete-only and don't depend
// on that endpoint, so they're left running against whatever payment rows
// already exist in the test DB.

describe("Payment Integration Tests", () => {

  it("should create a dummy rsvp",async () => {    
    const res = await request(app)
      .post("/reservation/newRsvp")
      .send(testRSVP);
      
      rsvpId = res.body.RSVP[0]?.RSVPID;
      eventId = res.body.RSVP[0]?.EventID;
      userId = res.body.RSVP[0]?.UserID;

    expect(rsvpId).toBeDefined(); // sanity check
    expect(eventId).toBeDefined(); // sanity check
    expect(userId).toBeDefined(); // sanity check
      
  });

  it("should delete the reservation", async () => {
    const res = await request(app)
    .delete(`/reservation/delete/${rsvpId}`);

    expect(res.status).toBe(200);
    expect(res.body.message)
    .toBe("Reservation deleted Successfully!!");
  });
});



describe("Negative Payment Integration Tests", () => {
  it("should fail to get and 'return 404' for non-existent payments", async () => {
    const res = await request(app)
    .get(`/payment/200`);
    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Payment not found");
  });
  
  it("should fail to get and 'return 400' for Invalid ID format", async () => {
    const res = await request(app)
    .get(`/payment/$'{paymentId}`);
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Invalid ID format");
  });

  it("should fail to getPaymentByEventID and 'return 404' for non-existent payments", async () => {
    const res = await request(app)
    .get(`/payment/event/200`);
    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Payment not found");
  });
  
  it("should fail to getPaymentByEventID and 'return 400' for Invalid ID format", async () => {
    const res = await request(app)
    .get(`/payment/event/$'{paymentId}`);
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Invalid ID format");
  });

  it("should fail to getPaymentByRSVPID and 'return 404' for non-existent payments", async () => {
    const res = await request(app)
    .get(`/payment/rsvp/200`);
    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Payment not found");
  });
  
  it("should fail to getPaymentByRSVPID and 'return 400' for Invalid ID format", async () => {
    const res = await request(app)
    .get(`/payment/rsvp/$'{paymentId}`);
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Invalid ID format");
  });
  
  it("should fail to delete and 'return 404' for non-existent payments", async () => {
    const res = await request(app)
    .delete(`/payment/delete/200`);
    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Payment not found");
  });  

  it("should fail to delete and 'return 400' for Invalid ID format", async () => {
    const res = await request(app)
    .delete(`/payment/delete/$'{paymentId}`);
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Invalid ID format");
  });
});