const express = require("express");
const protect = require("../middlewares/auth.middleware");
const createAddress = require("../controllers/address.controller");

const router = express.Router();

router.post("/create-address", protect, createAddress);

module.exports = router;
