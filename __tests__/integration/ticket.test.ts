import request from "supertest";
import app from "../../src/index"; 
let ticketId: number;

const testTicket = {
    UserID: 5,
    subject: "Wrong seat assignment",
    description: "I was assigned a seat far from the stage despite early booking.",
    ticketStatus: "Closed",
    created_at: "2025-01-03",
    updated_at: "2025-01-03"
  }

const updatedTicket = {
  subject: "Updated Issue Title",
  description: "Updated ticket description."
};

describe("Customer Support Integration Tests", () => {
// CREATE NEW TICKET
  it("should create a new customer support ticket", async () => {
    const res = await request(app)
      .post("/ticket/newTicket")
      .send(testTicket);

    expect(res.status).toBe(201);
    expect(res.body.message).toBe("Customer support ticket created successfully");
    expect(res.body.newTicket).toHaveProperty("TicketID");

    ticketId = res.body.newTicket?.TicketID;
  });

  // GET ALL TICKETS
  it("should retrieve all customer support tickets", async () => {
    const res = await request(app)
.get("/ticket/allTickets");

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Customer support tickets retrieved successfully");
  });

  // GET TICKET BY ID
  it("should retrieve a customer support ticket by ID", async () => {
    const res = await request(app)
    .get(`/ticket/${ticketId}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Customer support ticket retrieved successfully");
    
  });

  // GET TICKET BY USER ID
   it("should retrieve a customer support ticket by UserID", async () => {
    const res = await request(app)
    .get(`/ticket/user/5`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Customer support ticket retrieved successfully");
    
  });

  //UPDATE TICKET
  it("should update a customer support ticket by ID", async () => {
    const res = await request(app)
      .patch(`/ticket/updateticket/${ticketId}`)
      .send(updatedTicket);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Customer support ticket updated successfully");
    expect(res.body.updatedTicket.subject).toBe("Updated Issue Title");
  });

  //DELETE TICKET
  it("should delete a customer support ticket by ID", async () => {
    const res = await request(app)
    .delete(`/ticket/delete/${ticketId}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Customer support ticket deleted successfully");
  });

});


// describe("Negative Event Integration Tests", () => {

//   it("should fail to get and 'return 404' for non-existent Ticket", async () => {
//     const res = await request(app)
//     .get(`/ticket/200`);
//     expect(res.status).toBe(404);
//     expect(res.body.message).toBe("Ticket not found");
//   });
  
//   it("should fail to get and 'return 400' for Invalid ID format", async () => {
//     const res = await request(app)
//     .get(`/ticket/$'{ticketId}`);
//     expect(res.status).toBe(400);
//     expect(res.body.message).toBe("Invalid ID format");
//   });

//   it("should fail to getTicketByUserID and 'return 404' for non-existent Ticket", async () => {
//     const res = await request(app)
//     .get(`/ticket/user/200`);
//     expect(res.status).toBe(404);
//     expect(res.body.message).toBe("Ticket not found");
//   });
  
//   it("should fail to getTicketByUserID and 'return 400' for Invalid ID format", async () => {
//     const res = await request(app)
//     .get(`/ticket/user/$'{ticketId}`);
//     expect(res.status).toBe(400);
//     expect(res.body.message).toBe("Invalid ID format");
//   });

//   it("should fail to Update and 'return 404' for non-existent Ticket", async () => {
//     const res = await request(app)
//     .patch(`/ticket/update/200`);
//     expect(res.status).toBe(404);
//     expect(res.body.message).toBe("Ticket not found");
//   });
  
//   it("should fail to Update and 'return 400' for Invalid ID format", async () => {
//     const res = await request(app)
//     .patch(`/ticket/update/$'{ticketId}`);
//     expect(res.status).toBe(400);
//     expect(res.body.message).toBe("Invalid ID format");
//   });
  
//   it("should fail to delete and 'return 404' for non-existent Ticket", async () => {
//     const res = await request(app)
//     .delete(`/ticket/delete/200`);
//     expect(res.status).toBe(404);
//     expect(res.body.message).toBe("Ticket not found !!!  Failed to delete");
//   });  

//   it("should fail to delete and 'return 400' for Invalid ID format", async () => {
//     const res = await request(app)
//     .delete(`/ticket/delete/$'{ticketId}`);
//     expect(res.status).toBe(400);
//     expect(res.body.message).toBe("Invalid ID format");
//   });

// });
// //User Support Ticket Table
// export const UserSupportTicketsTable = pgTable("ticket", {
//     TicketID: serial("TicketID").primaryKey(),
//     UserID: integer("UserID").references(() =>UsersTable.UserID, {onDelete: "cascade"}).notNull(),
//     subject : varchar("subject", { length: 50 }).notNull(),
//     description: text("description").notNull(),
//     ticketStatus: StatusEnum("status").default('Pending'), 
//     created_at: date("created_date").notNull(),
//     updated_at: date("updated_date"),
// })
// 
