const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middlewares/authentication.middleware");
const {
  getUserOrders,
  getOrderById,
  createOrder,
  cancelOrder,
} = require("../controllers/order.controller");

router.use(verifyToken);

router.post("/", createOrder);
router.get("/", getUserOrders);
router.get("/:orderId", getOrderById);
router.patch("/:orderId/cancel", cancelOrder);

module.exports = router;
