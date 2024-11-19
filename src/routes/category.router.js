const express = require("express");
const protect = require("../middlewares/auth.middleware");
const {
  createCategory,
  getCategories,
  getCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/category.controller");

const router = express.Router();

router.post("/create-category", protect, createCategory);
router.get("/get-categories", getCategories);
router.get("/get-category", getCategory);
router.put("/update-category", protect, updateCategory);
router.delete("/delete-category", protect, deleteCategory);

module.exports = router;
