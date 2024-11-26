const db = require("../models");

const createCoupon = async (req, res) => {
  try {
    const { code, discountAmount } = req.body;
    const coupon = await db.Coupon.findOne({ where: { code } });
    if (coupon) {
      return res.status(400).json({
        success: false,
        message: "Coupon is already",
      });
    }
    const newCoupon = await db.Coupon.create({
      code,
      discountAmount,
      validFrom: Date.now(),
      validTo: Date.now() + 30 * 24 * 60 * 60 * 1000,
    });
    await newCoupon.save();
    return res.status(201).json({
      success: true,
      message: "Create coupon is sucessful",
      coupon: newCoupon,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const getAllCoupon = async (req, res) => {
  try {
    const limit = req.query.limit || 10;
    const page = req.query.page || 1;
    const offset = (page - 1) * limit;
    const coupons = await db.coupon.findAll({ offset, limit });
    return res.status(200).json({
      success: true,
      coupons,
      page,
      limit,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const getDetailCoupon = async (req, res) => {
  try {
    const { cid } = req.params;
    const coupon = await db.Coupon.findByPk(cid);
    if (!coupon) {
      return res.status(400).json({
        success: false,
        message: "Coupon is not found",
      });
    }
    return res.status(200).json({
      success: true,
      coupon,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const updateCoupon = async (req, res) => {
  try {
    const { code, discountAmount } = req.body;
    const { cid } = req.params;
    const coupon = await db.Coupon.findByPk(cid);
    if (!coupon) {
      return res.status(400).json({
        success: false,
        message: "Coupon is not found",
      });
    }
    coupon.code = code;
    coupon.discountAmount = discountAmount;
    await coupon.save();
    return res.status(200).json({
      success: true,
      message: "Update coupon is successful",
      coupon,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const deleteCoupon = async (req, res) => {
  try {
    const { cid } = req.params;
    const coupon = await db.Coupon.findByPk(cid);
    if (!coupon) {
      return res.status(400).json({
        success: false,
        message: "Coupon is not found",
      });
    }
    await coupon.deleteOne();
    return res.status(200).json({
      success: false,
      message: "Delete coupon is successful",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

module.exports = {
  createCoupon,
  getAllCoupon,
  getDetailCoupon,
  updateCoupon,
  deleteCoupon,
};
