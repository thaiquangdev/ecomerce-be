const db = require("../models");

const createReview = async (req, res) => {
  try {
    const { id } = req.user;
    const { comment, rating, productId } = req.body;
    const product = await db.Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product is not found",
      });
    }
    const newComment = await db.Review.create({
      comment,
      rating,
      userId: id,
      productId,
    });
    await newComment.save();

    const reviews = await db.Review.findAll({ where: { productId } });
    const totalRating = reviews.reduce((sum, item) => {
      return sum + item.rating;
    }, 0);

    const avgRating = parseFloat(totalRating / reviews.length);

    product.ratingAvg = avgRating;
    await product.save();

    return res.status(200).json({
      success: false,
      message: "Review product is successful",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const updateReview = async (req, res) => {
  try {
    const { id } = req.user;
    const { rid } = req.params;
    const { comment, rating, productId } = req.body;
    const review = await db.Review.findByPk(rid);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review is not found",
      });
    }
    review.comment = comment;
    review.rating = rating;
    review.productId = productId;
    review.userId = id;
    await review.save();
    return res.status(200).json({
      success: true,
      message: "Update review is successful",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const getAllReview = async (req, res) => {
  try {
    const reviews = await db.Review.findAll({
      where: { productId: req.params.pid },
    });
    return res.status(500).json({
      success: true,
      reviews,
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
  createReview,
  getAllReview,
  updateReview,
};
