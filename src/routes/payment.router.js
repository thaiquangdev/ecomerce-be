const express = require("express");
const protect = require("../middlewares/auth.middleware");
const {
  createPayment,
  callBack,
} = require("../controllers/paymentVnpay.controller");

const router = express.Router();

router.post("/payment", protect, createPayment);

module.exports = router;
