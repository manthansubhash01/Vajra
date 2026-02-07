const express = require("express");
const router = express.Router();
const {register, login} = require("../controllers/auth.controller")
const authenticate = require("../middlewares/authentication.middleware");

router.post("/resiter",register);
router.post("/login", authenticate, login);

module.exports = router;
