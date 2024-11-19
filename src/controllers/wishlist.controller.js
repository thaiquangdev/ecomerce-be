const db = require("../models");

const addWishlist = async (req, res) => {
  try {
    const { id } = req.user;
    const { productId } = req.body;
    const alreadyWishlist = await db.Wishlist.findOne({
      where: { userId: id, productId },
    });
    if (alreadyWishlist) {
      return res.status(400).json({
        success: false,
        message: "Wishlist is already",
      });
    }
    const newWishlist = await db.Wishlist.create({
      userId: id,
      productId: productId,
    });
    await newWishlist.save();
    return res.status(200).json({
      success: true,
      message: "Add wishlist successful",
      wishlist: newWishlist,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const getAllWishlist = async (req, res) => {
  try {
    const { id } = req.user;
    const wishlists = await db.Wishlist.findAll({
      where: { userId: id },
      include: {
        model: db.Product,
        as: "product",
        include: {
          model: db.ProductImage,
          as: "images",
        },
      },
    });
    return res.status(200).json({
      success: true,
      wishlists,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const deleteWishlist = async (req, res) => {
  try {
    const { pid } = req.params;
    const { id } = req.user;
    const wishlist = await db.Wishlist.findOne({
      where: { productId: pid, userId: id },
    });
    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: "Wishlist is not found",
      });
    }
    await wishlist.destroy();
    return res.status(200).json({
      success: true,
      message: "Delete wishlist is successful",
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
  addWishlist,
  getAllWishlist,
  deleteWishlist,
};
