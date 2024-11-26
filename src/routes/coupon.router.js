const express = require("express");
const protect = require("../middlewares/auth.middleware");
const {
  createCoupon,
  getAllCoupon,
  getDetailCoupon,
  updateCoupon,
  deleteCoupon,
} = require("../controllers/coupon.controller");

const router = express.Router();

router.post("/create-coupon", protect, createCoupon);
router.get("/get-coupons", getAllCoupon);
router.get("/get-coupon/:cid", getDetailCoupon);
router.put("/update-coupon/:cid", protect, updateCoupon);
router.delete("/delete-coupon/:cid", protect, deleteCoupon);

module.exports = router;
