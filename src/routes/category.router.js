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
router.get("/get-category/:slug", getCategory);
router.put("/update-category/:slug", protect, updateCategory);
router.delete("/delete-category/:slug", protect, deleteCategory);

module.exports = router;
