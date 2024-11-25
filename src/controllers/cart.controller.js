const db = require("../models");

const createCart = async (req, res) => {
  try {
    const { id } = req.user; // Lấy id người dùng từ req.user
    const { productId, size, quantity, price } = req.body; // Lấy thông tin sản phẩm từ request body

    // Kiểm tra xem người dùng đã có giỏ hàng chưa (giỏ hàng 'active')
    let cart = await db.Cart.findOne({
      where: {
        userId: id,
        state: "active", // Lọc giỏ hàng đang hoạt động
      },
    });

    // Nếu chưa có giỏ hàng, tạo một giỏ hàng mới
    if (!cart) {
      cart = await db.Cart.create({
        userId: id,
        state: "active", // Trạng thái giỏ hàng là 'active'
      });
    }

    // Kiểm tra xem sản phẩm đã có trong giỏ hàng chưa (theo size)
    let cartDetail = await db.CartDetail.findOne({
      where: {
        cartId: cart.id,
        productId,
        size, // Kiểm tra xem có trùng sản phẩm và size không
      },
    });

    if (cartDetail) {
      // Nếu đã có sản phẩm với cùng size, tăng số lượng
      cartDetail.quantity += quantity;
      // Tính lại tổng giá
      cartDetail.totalPrice = cartDetail.quantity * cartDetail.price;
      await cartDetail.save();
    } else {
      // Nếu chưa có, tạo mới một CartDetail
      cartDetail = await db.CartDetail.create({
        cartId: cart.id,
        productId,
        size,
        quantity,
        price,
        totalPrice: quantity * price,
      });
    }

    return res.status(201).json({
      success: true,
      message: "Product added to cart successfully",
      cartDetail,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const getAllCarts = async (req, res) => {
  try {
    const cartDetails = await db.CartDetail.findAll({
      include: [
        {
          model: db.Cart,
          as: "cart", // Liên kết với bảng Cart
          where: {
            state: "active", // Kiểm tra giỏ hàng có trạng thái 'active'
          },
          required: true, // Đây là điều kiện JOIN bắt buộc, chỉ lấy CartDetail thuộc giỏ hàng active
        },
        {
          model: db.Product,
          as: "product", // Đảm bảo rằng "product" là association name trong CartDetail
          attributes: ["id", "title"], // Lấy id và title của product
          include: {
            model: db.ProductImage,
            as: "images", // Đảm bảo rằng "images" là association name trong Product
            attributes: ["imageUrl"], // Lấy imageUrl từ bảng ProductImage
          },
        },
      ],
    });

    return res.status(200).json({
      success: true,
      cartDetails,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const updateQuantity = async (req, res) => {
  try {
    const { quantity } = req.body;
    const { cdid } = req.params;
    const { id: userId } = req.user;

    // Kiểm tra nếu quantity không hợp lệ
    if (!quantity || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be greater than 0",
      });
    }

    // Tìm CartDetail thuộc người dùng hiện tại
    const cart = await db.CartDetail.findOne({
      where: { id: cdid },
      include: [
        {
          model: db.Cart,
          as: "cart",
          where: { userId }, // Liên kết với bảng Cart để kiểm tra userId
        },
      ],
    });

    // Nếu không tìm thấy giỏ hàng
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart item not found",
      });
    }

    // Cập nhật quantity
    cart.quantity = quantity;
    await cart.save();

    return res.status(200).json({
      success: true,
      message: "Update quantity is successful",
      cart, // Trả về thông tin giỏ hàng đã cập nhật
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const deleteCart = async (req, res) => {
  try {
    const { cid } = req.params;
    const cart = await db.Cart.findByPk(cid);
    if (!cart) {
      return res.status(400).json({
        success: false,
        message: "Cart is not found",
      });
    }
    await cart.destroy();
    return res.status(200).json({
      success: true,
      message: "Delete cart is successful",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const deleteCartDetail = async (req, res) => {
  try {
    const { cartId, productId } = req.params; // Lấy cartId và productId từ URL params

    // Kiểm tra xem bản ghi có tồn tại không
    const cartDetail = await db.CartDetail.findOne({
      where: {
        id: cartId,
        productId: productId,
      },
    });

    if (!cartDetail) {
      return res.status(404).json({
        success: false,
        message: "Cart detail not found",
      });
    }

    // Xóa bản ghi
    await cartDetail.destroy();

    return res.status(200).json({
      success: true,
      message: "Product removed from cart successfully",
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
  createCart,
  getAllCarts,
  updateQuantity,
  deleteCart,
  deleteCartDetail,
};
