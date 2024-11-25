const express = require("express");
const protect = require("../middlewares/auth.middleware");
const {
  createCart,
  getAllCarts,
  deleteCart,
  updateQuantity,
  deleteCartDetail,
} = require("../controllers/cart.controller");

const router = express.Router();

router.post("/create-cart", protect, createCart);
router.get("/get-carts", protect, getAllCarts);
router.put("/update-cart/:cdid", protect, updateQuantity);
router.delete("/delete-cart/:cid", protect, deleteCart);
router.delete(
  "/delete-cartdetail/:cartId/:productId",
  protect,
  deleteCartDetail
);

module.exports = router;
