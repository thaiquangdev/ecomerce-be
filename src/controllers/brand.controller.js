const { default: slugify } = require("slugify");
const db = require("../models");

const createBrand = async (req, res) => {
  try {
    const { brandName } = req.body;
    if (!brandName) {
      return res.status(400).json({
        success: false,
        message: "brand name is require",
      });
    }
    const brandSlug = slugify(brandName);
    const brand = await db.Brand.findOne({ where: { brandSlug } });
    if (brand) {
      return res.status(400).json({
        success: false,
        message: "Brand is already",
      });
    }
    const newBrand = await db.Brand.create({
      brandName,
      brandSlug,
    });
    return res.status(201).json({
      success: true,
      message: "Create brand is successful",
      brand: newBrand,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const getBrands = async (req, res) => {
  try {
    const brands = await db.Brand.findAll({
      include: {
        model: db.Product,
        as: "products",
      },
    });
    return res.status(200).json({
      success: true,
      brands,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const getBrand = async (req, res) => {
  try {
    const { bid } = req.params;
    const brand = await db.Brand.findByPk(bid, {
      include: {
        model: db.Product,
        as: "products",
      },
    });
    if (!brand) {
      return res.status(404).json({
        success: false,
        message: "Brand is not found",
      });
    }
    return res.status(200).json({
      success: true,
      brand,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const updateBrand = async (req, res) => {
  try {
    const { bid } = req.params;
    const { brandName } = req.body;
    if (!brandName) {
      return res.status(400).json({
        success: false,
        message: "Brand name is require",
      });
    }
    const brand = await db.Brand.findByPk(bid);
    if (!brand) {
      return res.status(404).json({
        success: false,
        message: "Brand is not found",
      });
    }
    const brandSlug = slugify(brandName);
    brand.brandName = brandName;
    brand.brandSlug = brandSlug;

    await brand.save();

    return res.status(200).json({
      success: true,
      message: "Update brand is successful",
      brand,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const deleteBrand = async (req, res) => {
  try {
    const { bid } = req.params;
    const brand = await db.Brand.findByPk(bid);
    if (!brand) {
      return res.status(404).json({
        success: false,
        message: "Brand is not found",
      });
    }
    await brand.destroy();
    return res.status(200).json({
      success: true,
      message: "Delete brand is successful",
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
  createBrand,
  getBrands,
  getBrand,
  updateBrand,
  deleteBrand,
};
