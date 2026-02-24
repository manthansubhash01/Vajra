const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../../src/app");
const User = require("../../src/models/user.model");

describe("Register API", () => {
    beforeEach(async () => {
        await User.deleteMany();
    });

    afterAll(async () => {
        await mongoose.connection.dropDatabase();
    });

    test("Should register user successfully", async () => {
        const res = await request(app).post("/api/auth/register").send({
        name: "Test User",
        password: "Test@432",
        age: 20,
        phone: "0090234456",
        email: "test@example.com",
        address: "test address",
        });

        expect(res.statusCode).toBe(201);
        expect(res.body.message).toBe("User registered successfully");
    });

    test("Missing Field", async () => {
        const res = await request(app).post("/api/auth/register").send({
        name: "Test User",
        password: "Test@432",
        age: 20,
        address: "test address",
        });

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe("All fields are required");
    });

    test("Invalid email", async () => {
        const res = await request(app).post("/api/auth/register").send({
            name: "Test User",
            password: "Test@432",
            age: 20,
            phone: "0090234456",
            email: "invalidemail",
            address: "test address",
        });

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe("Email is not valid");
    });
});
