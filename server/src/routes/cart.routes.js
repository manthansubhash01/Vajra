const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middlewares/authentication.middleware");
const {
    addToCart,
    getCart,
    updateQuantity,
    removeFromCart,
    clearCart,
} = require("../controllers/cart.controller");

router.use(verifyToken);

router.get("/", getCart);

router.post("/", addToCart);

router.patch("/:productId/:variantSku", updateQuantity);

router.delete("/clear", clearCart);

router.delete("/:productId/:variantSku", removeFromCart);

module.exports = router;
