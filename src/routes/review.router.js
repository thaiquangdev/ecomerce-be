const express = require("express");
const protect = require("../middlewares/auth.middleware");
const {
  createReview,
  getAllReview,
  updateReview,
} = require("../controllers/review.controller");

const router = express.Router();

router.post("/create-review", protect, createReview);
router.get("/get-reviews/:pid", getAllReview);
router.put("/update-review/:rid", protect, updateReview);

module.exports = router;
