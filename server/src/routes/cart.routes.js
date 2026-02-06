const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middlewares/authentication.middleware");
const {
  addToCart,
  getCart,
  updateQuantity,
  removeFromCart,
} = require("../controllers/cart.controller");

router.use(verifyToken);

router.get("/", getCart);

router.post("/", addToCart);

router.patch("/:productId/:variantSku", updateQuantity);

router.delete("/:productId/:variantSku", removeFromCart);

module.exports = router;
