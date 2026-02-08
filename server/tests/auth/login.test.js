const request = require("supertest");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const app = require("../../src/app");
const User = require("../../src/models/user.model");

describe("Login API", () => {

    beforeAll(async () => {
        await mongoose.connect(process.env.TEST_DB_URI);
    });

    beforeEach(async () => {
        await User.deleteMany();
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });

    test("Should login user successfully", async () => {
        const hashedPassword = await bcrypt.hash("123456", 10);

        await User.create({
            name: "Manthan",
            phone: "9999999999",
            password: hashedPassword
        });

        const res = await request(app)
            .post("/api/auth/login")
            .send({
            name: "Manthan",
            phone: "9999999999",
            password: "123456"
        });

        expect(res.statusCode).toBe(200);
        expect(res.body.token).toBeDefined();
    });
});