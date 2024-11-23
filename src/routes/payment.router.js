const express = require("express");
const protect = require("../middlewares/auth.middleware");
const {
  createPayment,
  callBack,
  getAllOrders,
  getDetailOrder,
  getAllOrdersForAdmin,
  updateOrderStatus,
  markOrderAsReceived,
  cancelOrder,
} = require("../controllers/paymentVnpay.controller");

const router = express.Router();

router.post("/payment", protect, createPayment);

router.get("/get-orders", protect, getAllOrders);

router.get("/get-order/:oid", protect, getDetailOrder);

router.get("/get-orders-admin", protect, getAllOrdersForAdmin);

router.put("/update-status-order/:oid", protect, updateOrderStatus);

router.put("/mark-order", protect, markOrderAsReceived);

router.put("/cancel-order/:oid", protect, cancelOrder);

module.exports = router;
