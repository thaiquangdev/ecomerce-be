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
router.get("/get-brand/:slug", getBrand);
router.put("/update-brand/:slug", protect, updateBrand);
router.delete("/delete-brand/:slug", protect, deleteBrand);

module.exports = router;
