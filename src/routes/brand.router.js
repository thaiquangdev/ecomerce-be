const express = require("express");
const protect = require("../middlewares/auth.middleware");
const {
  createBrand,
  getBrands,
  getBrand,
  updateBrand,
  deleteBrand,
} = require("../controllers/brand.controller");

const router = express.Router();

router.post("/create-brand", protect, createBrand);
router.get("/get-brands", getBrands);
router.get("/get-brand/:bid", getBrand);
router.put("/update-brand/:bid", protect, updateBrand);
router.delete("/delete-brand/:bid", protect, deleteBrand);

module.exports = router;
