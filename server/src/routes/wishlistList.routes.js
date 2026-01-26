const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middlewares/authentication.middleware");
const {
    addToWishlist,
    removeFromWishlist,
    getWishlist,
    clearWishlist,
} = require("../controllers/wishlist.controller");

router.use(verifyToken);

router.get("/", getWishlist);

router.post("/", addToWishlist);

router.delete("/:productId", removeFromWishlist);

router.delete("/", clearWishlist);

module.exports = router;
