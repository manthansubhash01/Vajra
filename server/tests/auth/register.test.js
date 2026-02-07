const supertest = require("supertest");
const mongoose = require("mongoose");
const app = require("../../src/app");
const User = require("../../src/models/user.model");

describe("Register API", () => {

    beforeAll(async() => {
        await mongoose.connect(process.env.TEST_DB_URI);
    }); 

    beforeEach(async() => {
        await User.deleteMany();
    });

    afterAll(async() => {
        await mongoose.connection.close();
    });

    test("Should register user successfully", () => {
        
    })

})