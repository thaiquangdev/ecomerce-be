const express = require("express");
const protect = require("../middlewares/auth.middleware");
const {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/product.controller");
const upload = require("../configs/multer.config");

const router = express.Router();

router.post(
  "/create-product",
  protect,
  upload.array("images", 4),
  createProduct
);

router.get("/get-products", getProducts);
router.get("/get-product/:slug", getProduct);
router.put(
  "/update-product/:pid",
  protect,
  upload.array("images", 4),
  updateProduct
);
router.delete("/delete-product/:slug", protect, deleteProduct);

module.exports = router;
