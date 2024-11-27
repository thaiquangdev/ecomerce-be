const { default: slugify } = require("slugify");
const db = require("../models");
const cloudinary = require("../configs/cloudinary.config");
const { Op } = require("sequelize");

const createProduct = async (req, res) => {
  try {
    const {
      title,
      description,
      price,
      discount,
      brandId,
      categoryId,
      variants,
    } = req.body;
    const files = req.files;
    const slug = slugify(title);

    // Kiểm tra sản phẩm đã tồn tại
    const existingProduct = await db.Product.findOne({ where: { slug } });
    if (existingProduct) {
      return res.status(400).json({
        success: false,
        message: "Product already exists",
      });
    }

    // Tạo mới sản phẩm
    const newProduct = await db.Product.create({
      title,
      slug,
      description,
      price,
      discount,
      brandId,
      categoryId,
    });

    // Xử lý variants nếu có
    if (variants) {
      const parsedVariants = JSON.parse(variants);
      for (let variant of parsedVariants) {
        await db.ProductVariant.create({
          size: variant.size,
          stock: variant.stock,
          sku: variant.sku,
          productId: newProduct.id,
        });
      }
    }

    // Upload ảnh lên Cloudinary và lưu trong cơ sở dữ liệu
    const imageUrls = [];
    if (files) {
      for (const file of files) {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: "thuongmaidientu", // Lưu vào thư mục thuongmaidientu trên Cloudinary
        });
        imageUrls.push(result.secure_url);

        // Lưu URL ảnh vào bảng ProductImage
        await db.ProductImage.create({
          productId: newProduct.id,
          imageUrl: result.secure_url,
          imageId: result.public_id,
        });
      }
    }

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      product: newProduct,
      images: imageUrls,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const getProducts = async (req, res) => {
  try {
    const { name } = req.query;
    const limit = parseInt(req.query.limit) || 8;
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * limit;
    const { sort } = req.query;
    // cau hinh sap xep mac dinh
    let order = [];
    switch (parseInt(sort)) {
      case 1:
        order = [["sold", "DESC"]];
        break;
      case 2:
        order = [["totalRating", "DESC"]];
        break;
      case 3:
        order = [["createdAt", "DESC"]];
        break;
      case 4:
        order = [["price", "ASC"]];
        break;
      case 5:
        order = [["price", "DESC"]];
        break;
      default:
        order = [["id", "ASC"]];
        break;
    }

    // tạo câu lệnh where
    const whereCondition = {};

    if (name) {
      whereCondition.title = { [db.Sequelize.Op.like]: `%${name}%` };
    }

    const products = await db.Product.findAll({
      where: whereCondition,
      include: [
        {
          model: db.ProductImage,
          as: "images",
        },
        {
          model: db.ProductVariant,
          as: "variants",
        },
        {
          model: db.Brand,
          as: "brand",
          attributes: ["brandName"], // Lấy chỉ trường name của Brand
        },
        {
          model: db.Category,
          as: "category",
          attributes: ["categoryName"], // Lấy chỉ trường name của Category
        },
      ],
      order,
      limit,
      offset,
    });
    const totalProducts = await db.Product.count({ where: whereCondition });
    return res.status(200).json({
      success: true,
      products,
      offset: offset + limit,
      totalProducts,
      page,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const getProduct = async (req, res) => {
  try {
    const { slug } = req.params;
    const product = await db.Product.findOne({
      where: { slug },
      include: [
        {
          model: db.ProductImage,
          as: "images",
        },
        {
          model: db.ProductVariant,
          as: "variants",
        },
        {
          model: db.Brand,
          as: "brand",
        },
        {
          model: db.Category,
          as: "category",
        },
      ],
    });
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product is not found",
      });
    }

    const relatedProducts = await db.Product.findAll({
      where: {
        brandId: product.brandId,
        categoryId: product.categoryId,
        slug: { [Op.ne]: product.slug },
      },
      include: [
        {
          model: db.ProductImage,
          as: "images",
        },
        {
          model: db.ProductVariant,
          as: "variants",
        },
        {
          model: db.Brand,
          as: "brand",
          attributes: ["brandName"],
        },
        {
          model: db.Category,
          as: "category",
          attributes: ["categoryName"], // Lấy chỉ trường name của Category
        },
      ],
      limit: 4, // Giới hạn số lượng sản phẩm liên quan
    });

    return res.status(200).json({
      success: true,
      product, // Sản phẩm chính
      relatedProducts, // Sản phẩm liên quan
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { pid } = req.params;
    const {
      title,
      description,
      price,
      discount,
      brandId,
      categoryId,
      variants, // Dữ liệu variants gửi từ client
    } = req.body;
    const files = req.files;

    // Tìm sản phẩm theo ID
    const product = await db.Product.findByPk(pid, {
      include: [
        { model: db.ProductImage, as: "images" },
        { model: db.ProductVariant, as: "variants" },
      ],
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Cập nhật thông tin sản phẩm
    const slug = title ? slugify(title) : product.slug;
    await product.update({
      title: title || product.title,
      slug,
      description: description || product.description,
      price: price || product.price,
      discount: discount || product.discount,
      brandId: brandId || product.brandId,
      categoryId: categoryId || product.categoryId,
    });

    // Xử lý cập nhật hoặc thêm mới variants
    if (variants) {
      const parsedVariants = JSON.parse(variants);

      for (const item of parsedVariants) {
        if (item.id) {
          // Nếu variant có ID, cập nhật
          const existingVariant = await db.ProductVariant.findByPk(item.id);
          if (existingVariant) {
            await existingVariant.update({
              size: item.size || existingVariant.size,
              stock: item.stock || existingVariant.stock,
              sku: item.sku || existingVariant.sku,
            });
          }
        } else {
          // Nếu không có ID, thêm mới
          await db.ProductVariant.create({
            size: item.size,
            stock: item.stock,
            sku: item.sku,
            productId: pid,
          });
        }
      }
    }

    // Xử lý ảnh: Nếu có file mới, xóa ảnh cũ và tải lên ảnh mới
    if (files) {
      // Xóa ảnh cũ trong Cloudinary
      for (const image of product.images) {
        await cloudinary.uploader.destroy(image.imageId);
      }
      // Xóa ảnh cũ trong DB
      await db.ProductImage.destroy({ where: { productId: pid } });

      // Upload ảnh mới
      for (const file of files) {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: "thuongmaidientu",
        });

        await db.ProductImage.create({
          productId: pid,
          imageUrl: result.secure_url,
          imageId: result.public_id,
        });
      }
    }

    // Trả về kết quả sau khi cập nhật
    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { slug } = req.params;
    const product = await db.Product.findOne({
      where: { slug },
      include: [
        {
          model: db.ProductImage,
          as: "images",
        },
        {
          model: db.ProductVariant,
          as: "variants",
        },
      ],
    });
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }
    for (const image of product.images) {
      await cloudinary.uploader.destroy(image.imageId);
    }
    await product.destroy();
    return res.status(200).json({
      success: true,
      message: "Delete product is successful",
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
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
};
