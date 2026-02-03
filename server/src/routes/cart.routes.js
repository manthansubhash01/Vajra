const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middlewares/authentication.middleware");
const { addToCart, getCart } = require("../controllers/cart.controller");

router.use(verifyToken);

router.get("/", getCart);

router.post("/", addToCart);

module.exports = router;
