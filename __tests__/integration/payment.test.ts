import request from "supertest";
import app from "../../src/index";

let paymentId: number;
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

  const testPayment = {
    RSVPID: 1,
    EventID: 1,
    amount: 2000.00,
    balance:1000.00,
    paymentStatus: "In Progress",
    paymentDate: "2025-07-01",
    paymentMethod: "M-Pesa",
    TransactionID: "MP001001001",
    created_at: "2025-07-01",
    updated_at: "2025-07-01"
}


  it("should create a new payment", async () => {
    const res = await request(app)
      .post("/payment/makePayment")
      .send(testPayment);
      
    expect(res.body.message).toBe("Payment made successfully!!");
    paymentId = res.body.newPayment?.PaymentID;

    expect(paymentId).toBeDefined(); // sanity check
    expect(res.status).toBe(201);
  });

  it("should get all payments", async () => {
    const res = await request(app)
    .get("/payment/allPayment");

    expect(res.status).toBe(200);
    expect(res.body.allPayments.length).toBeGreaterThan(0);
  });

  it("should get payment by ID", async () => {
    const res = await request(app).get(`/payment/${paymentId}`);
    expect(res.status).toBe(200);
  });

  it("should delete the payment", async () => {
    const res = await request(app).delete(`/payment/delete/${paymentId}`);
    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Payment deleted Successfully!!");
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