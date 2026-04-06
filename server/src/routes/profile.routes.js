const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middlewares/authentication.middleware");
const {
  updateAddress,
  updatePhone,
  updatePassword,
  getProfile,
} = require("../controllers/profile.controller");

router.use(verifyToken);

router.get("/", getProfile);

router.patch("/address", updateAddress);

router.patch("/phone", updatePhone);

router.patch("/password", updatePassword);

module.exports = router;