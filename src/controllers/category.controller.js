const slugify = require("slugify");
const db = require("../models");

const createCategory = async (req, res) => {
  try {
    const { categoryName } = req.body;

    if (!categoryName) {
      return res.status(400).json({
        success: false,
        message: "Category name is required",
      });
    }

    const categorySlug = slugify(categoryName);
    const category = await db.Category.findOne({ where: { categorySlug } });

    if (category) {
      return res.status(400).json({
        success: false,
        message: "Category already exists",
      });
    }

    const newCategory = await db.Category.create({
      categoryName,
      categorySlug,
    });

    return res.status(201).json({
      success: true,
      message: "Create category is successful",
      category: newCategory,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const getCategories = async (req, res) => {
  try {
    const { name } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 8;
    const offset = (page - 1) * limit;

    // tạo điều kiện where
    const whereCondition = {};

    if (name) {
      // sử dụng like để tìm kiểm theo từ khóa gần đúng
      whereCondition.categoryName = { [db.Sequelize.Op.like]: `%${name}%` };
    }

    const categories = await db.Category.findAll({
      where: whereCondition,
      include: {
        model: db.Product,
        as: "products",
      },
      limit,
      offset,
    });
    const totalCategories = await db.Category.count({
      where: whereCondition,
    });
    return res.status(200).json({
      success: true,
      categories,
      limit,
      page,
      offset,
      totalCategories,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const getCategory = async (req, res) => {
  try {
    const { slug } = req.params;
    const category = await db.Category.findOne({
      where: { categorySlug: slug },
      include: {
        model: db.Product,
        as: "products",
      },
    });
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category is not found",
      });
    }
    return res.status(200).json({
      success: true,
      category,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const updateCategory = async (req, res) => {
  try {
    const { slug } = req.params;
    const { categoryName } = req.body;
    if (!categoryName) {
      return res.status(400).json({
        success: false,
        message: "Category name is require",
      });
    }
    const category = await db.Category.findOne({
      where: { categorySlug: slug },
    });
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category is not found",
      });
    }
    const categorySlug = slugify(categoryName);
    category.categoryName = categoryName;
    category.categorySlug = categorySlug;
    await category.save();
    return res.status(200).json({
      success: true,
      message: "Update category is successful",
      category,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const { slug } = req.params;
    const category = await db.Category.findOne({
      where: { categorySlug: slug },
    });
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category is not found",
      });
    }
    await category.destroy();
    return res.status(200).json({
      success: true,
      message: "Delete category is sucessful",
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
  createCategory,
  getCategories,
  getCategory,
  updateCategory,
  deleteCategory,
};
