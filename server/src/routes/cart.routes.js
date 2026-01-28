const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middlewares/authentication.middleware");
const { addToCart } = require("../controllers/cart.controller");

router.use(verifyToken);

router.post("/", addToCart);

module.exports = router;
