import request from "supertest";
import app from "../../src/index"; // Update if your app is exported from another file
import db from "../../src/Drizzle/db";

import { UsersTable } from "../../src/Drizzle/schema";
import { eq } from "drizzle-orm";

let createdUserEmail: string = "";
let VerificationCode: string = "";

describe("Auth Integration Tests", () => {
  const testUser = {
    firstName: "Test",
    lastName: "User",
    email: `testuser${Date.now()}@example.com`, // unique email per run
    password: "password123",
    phoneNumber: 1234567890,
    address: "Test Address",
    role: "user",
  };

  // Create user
  it("should register a new user and send verification code", async () => {
    const res = await request(app)
      .post("/auth/register")
      .send(testUser);

    expect(res.status).toBe(201);
    expect(res.body.message).toContain("User created. Verification code sent to email.");
    createdUserEmail = testUser.email;

    // Get verification code from DB (assuming test DB)
    const user = await db.query.UsersTable.findFirst({
      where: eq(UsersTable.email, createdUserEmail),
    });
    VerificationCode = user?.verificationCode || "";
    expect(VerificationCode).not.toBe("");
  });

  // Verify user
  it("should verify the newly created user", async () => {
    const res = await request(app)
      .post("/auth/verify")
      .send({
        email: createdUserEmail,
        verificationCode: VerificationCode,
      });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("User verified successfully");
  });

  // Login user
  it("should log in the verified user", async () => {
    const res = await request(app)
      .post("/auth/login")
      .send({
        email: createdUserEmail,
        password: testUser.password,
      });

      console.log(createdUserEmail);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Login successfull");
    expect(res.body).toHaveProperty("token");
    expect(res.body.user.email).toBe(createdUserEmail);
  });

  // Get all users
  it("should fetch all users", async () => {
    const res = await request(app).get("/User/allUsers");
    expect(res.status).toBe(200);
    expect(res.body.data).toBeInstanceOf(Array);
  });

  // Get user by ID
  it("should fetch a user by ID", async () => {
    const user = await db.query.UsersTable.findFirst({
      where:  eq(UsersTable.email, createdUserEmail)  
    });

    const res = await request(app).get(`/User/${user?.UserID}`);

    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe(createdUserEmail);
  });

  // Update user by ID
  it("should update user info", async () => {
    const user = await db.query.UsersTable.findFirst({
      where: eq(UsersTable.email, createdUserEmail) 
    });

    const res = await request(app)
      .patch(`/User/update/${user?.UserID}`)
      .send({
        UserID: user?.UserID,
        firstName: "Updated",
        role: "admin",
      });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("User updated successfully ✅");
  });

  // Delete user
  it("should delete user by ID", async () => {
    const user = await db.query.UsersTable.findFirst({
      where: eq(UsersTable.email, createdUserEmail),
    });

    const res = await request(app).delete(`/User/delete/${user?.UserID}`);
    expect(res.status).toBe(204);
  });
});
