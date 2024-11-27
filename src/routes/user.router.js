const express = require("express");
const protect = require("../middlewares/auth.middleware");
const {
  changePassword,
  getUser,
  forgotPassword,
  resetPassword,
  getUsers,
} = require("../controllers/user.controller");

const router = express.Router();

router.put("/change-password", protect, changePassword);
router.get("/get-user", protect, getUser);
router.get("/get-users", protect, getUsers);
router.get("/get-user-id/:uid", protect, getUsers);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

module.exports = router;
