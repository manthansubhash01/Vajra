const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middlewares/authentication.middleware");
const {
    createReturnRequest,
    getUserReturns,
    getReturnById,
    cancelReturnRequest,
} = require("../controllers/return.controller");

router.use(verifyToken);

router.post("/", createReturnRequest);
router.get("/user/my-returns", getUserReturns);
router.get("/:returnId", getReturnById);
router.patch("/:returnId/cancel", cancelReturnRequest);

module.exports = router;
