const request = require("supertest");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const app = require("../../src/app");
const User = require("../../src/models/user.model");

describe("Login API", () => {
  beforeEach(async () => {
    await User.deleteMany();
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
  });

  test("Should login user successfully", async () => {
    const hashedPassword = await bcrypt.hash("123456", 10);

    await User.create({
      name: "Manthan",
      phone: "9999999999",
      email: "manthan@test.com",
      password: hashedPassword,
      age: 20,
      address: "Pune",
    });

    const res = await request(app).post("/api/auth/login").send({
      name: "Manthan",
      password: "123456",
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  test("Should fail when user not found", async () => {
    const res = await request(app).post("/api/auth/login").send({
      name: "Unknown",
      password: "123456",
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("User not found");
  });

  test("Should fail when password is incorrect", async () => {
    const hashedPassword = await bcrypt.hash("123456", 10);

    await User.create({
      name: "Manthan",
      phone: "9999999999",
      email: "manthan@test.com",
      password: hashedPassword,
      age: 20,
      address: "Pune",
    });

    const res = await request(app).post("/api/auth/login").send({
      name: "Manthan",
      password: "wrongpassword",
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Incorrect password");
  });
});
