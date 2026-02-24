require("dotenv").config();
const mongoose = require("mongoose");
const connectDb = require("../src/config/dbConnection");

beforeAll(async () => {
    await connectDb();
}, 30000);

afterAll(async () => {
    await mongoose.connection.close();
});
