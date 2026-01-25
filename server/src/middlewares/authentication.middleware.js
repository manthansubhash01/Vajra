const User = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const authenticate = async (req, res, next) => {
    try {
        const { name, phone, password } = req.body;

        if (!name && !phone) {
        return res
            .status(400)
            .json({ message: "Either name or phone is required" });
        }

        if (!password) {
        return res.status(400).json({ message: "Password is required" });
        }

        const user = await User.findOne({
        $or: [{ name }, { phone }],
        });

        if (!user) {
        return res.status(400).json({ message: "User not found" });
        }

        const isCorrectPassword = await bcrypt.compare(password, user.password);

        if (!isCorrectPassword) {
        return res
            .status(400)
            .json({
            message: "Incorrect password please try again with correct one",
            });
        }

        req.body.user = user;

        next();
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Failed to authenticate user" });
    }
    };

    const verifyToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "No token provided" });
        }

        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.userId = decoded.id;
        req.userName = decoded.name;

        next();
    } catch (err) {
        if (err.name === "TokenExpiredError") {
        return res.status(401).json({ message: "Token expired" });
        }
        if (err.name === "JsonWebTokenError") {
        return res.status(401).json({ message: "Invalid token" });
        }
        console.error(err);
        return res.status(500).json({ message: "Failed to authenticate token" });
    }
};

module.exports = { authenticate, verifyToken };
