const express = require("express");
const protect = require("../middlewares/auth.middleware");
const {
  changePassword,
  getUser,
  forgotPassword,
  resetPassword,
} = require("../controllers/user.controller");

const router = express.Router();

router.put("/change-password", protect, changePassword);
router.get("/get-user", protect, getUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

module.exports = router;
