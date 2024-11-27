"use strict";

const axios = require("axios").default; // npm install axios
const CryptoJS = require("crypto-js"); // npm install crypto-js
const moment = require("moment"); // npm install moment
const db = require("../models");

// APP INFO
const config = {
  app_id: "2554",
  key1: "sdngKKJmqEMzvh5QQcdD2A9XBSKUNaYn",
  key2: "trMrHtvjo6myautxDUiAcYsVtaeQ8nhf",
  endpoint: "https://sb-openapi.zalopay.vn/v2/create",
};

const createPayment = async (req, res) => {
  try {
    const { id: userId } = req.user; // Lấy userId từ req.user
    const { cartId, amount, addressId, paymentGateway, addressDetails } =
      req.body;

    // Kiểm tra input
    if (!cartId || !amount || !paymentGateway) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields: cartId, amount, addressId, or paymentGateway",
      });
    }

    // Kiểm tra giá trị hợp lệ
    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Amount must be greater than 0",
      });
    }

    let finalAddressId = addressId;

    if (!addressId) {
      const defaultAddress = await db.Address.findOne({
        where: { userId, isDefault: true },
      });

      if (defaultAddress) {
        finalAddressId = defaultAddress.id;
      } else {
        if (!addressDetails) {
          return res.status(400).json({
            success: false,
            message: "Address is required if no default address exists",
          });
        }

        const newAddress = await db.Address.create({
          userId,
          ...addressDetails,
          isDefault: false,
        });

        finalAddressId = newAddress.id;
      }
    }

    const existPayment = await db.Payment.findOne({
      where: { cartId, paymentStatus: "pending", paymentMethod: "ZaloPay" },
    });
    if (existPayment) {
      await existPayment.destroy();
    }

    // Nếu là thanh toán tiền mặt, chỉ cần tạo payment mới và trạng thái là "Pending"
    if (paymentGateway === "cash") {
      const newPayment = await db.Payment.create({
        userId,
        cartId,
        amount,
        paymentMethod: "Cash",
        paymentStatus: "Pending", // Trạng thái là Pending vì chưa thanh toán
        paymentDate: new Date(),
        transactionId: `cash_${moment().format("YYMMDDHHmmss")}`, // Tạo mã giao dịch duy nhất cho tiền mặt
        addressId: finalAddressId,
        paymentGateway,
      });

      const cart = await db.Cart.findOne({
        where: { id: cartId },
        transaction,
      });
      if (cart) {
        cart.state = "shipping"; // hoặc `processing`
        await cart.save();
      }

      const cartDetails = await db.cartDetail.findAll({
        where: { cartId },
      });

      for (const item of cartDetails) {
        const variant = await db.ProductVariant.findOne({
          where: { productId: item.productId, size: item.size },
        });

        if (!variant) {
          throw new Error(
            `Product variant with ID ${item.productId} not found`
          );
        }

        // Kiểm tra stock
        if (variant.stock < item.quantity) {
          throw new Error(
            `Insufficient stock for variant (Size: ${variant.size})`
          );
        }
        variant.stock -= item.quantity;
        variant.sold += item.quantity;
        await variant.save();
      }

      return res.status(200).json({
        success: true,
        message: "Payment created successfully",
        payment: newPayment,
      });
    }

    // Nếu là thanh toán qua cổng khác (ví dụ ZaloPay), thực hiện như trước
    const embed_data = {
      redirectUrl: "https://facebook.com",
    };

    const transID = Math.floor(Math.random() * 1000000);
    const app_trans_id = `${moment().format("YYMMDD")}_${transID}`;

    const order = {
      app_id: config.app_id,
      app_trans_id,
      app_user: `user${userId}`,
      app_time: Date.now(),
      item: JSON.stringify([{}]),
      embed_data: JSON.stringify(embed_data),
      amount: amount * 22000, // Chuyển đổi USD sang VND nếu cần
      description: `Payment for order #${transID}`,
      bank_code: paymentGateway,
      callback_url: "https://e24f-116-105-20-73.ngrok-free.app/callback",
    };

    const data =
      config.app_id +
      "|" +
      order.app_trans_id +
      "|" +
      order.app_user +
      "|" +
      order.amount +
      "|" +
      order.app_time +
      "|" +
      order.embed_data +
      "|" +
      order.item;
    order.mac = CryptoJS.HmacSHA256(data, config.key1).toString();

    const response = await axios.post(config.endpoint, null, { params: order });

    if (response.data.return_code === 1) {
      const zpTransToken = response.data.zp_trans_token || null;
      const orderUrl = response.data.order_url || null;
      const orderToken = response.data.order_token || null;
      const qrCode = response.data.qr_code || null;

      const newPayment = await db.Payment.create({
        userId,
        cartId,
        amount,
        paymentMethod: "ZaloPay",
        paymentStatus: "Pending",
        paymentDate: new Date(),
        transactionId: order.app_trans_id,
        zpTransToken,
        orderUrl,
        orderToken,
        qrCode,
        addressId: finalAddressId,
        paymentGateway,
        rawResponse: JSON.stringify(response.data),
      });

      return res.status(200).json({
        success: true,
        message: "Payment created successfully",
        payment: newPayment,
        zalopayResponse: response.data,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Payment creation failed",
        zalopayResponse: response.data,
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const callBack = async (req, res) => {
  try {
    let result = {};

    let dataStr = req.body.data;
    let reqMac = req.body.mac;

    let mac = CryptoJS.HmacSHA256(dataStr, config.key2).toString();

    console.log(mac);

    if (reqMac !== mac) {
      result.return_code = -1;
      result.return_message = "mac not equal";
    } else {
      let dataJson = JSON.parse(dataStr); // Sửa lại phần này

      console.log(dataJson);

      if (dataJson.zp_trans_id) {
        const { app_trans_id, amount, user_id, payment_gateway } = dataJson;

        const payment = await db.Payment.findOne({
          where: { transactionId: app_trans_id },
        });

        if (!payment) {
          result.return_code = 0;
          result.return_message = "Payment not found";
          return res.json(result); // Nếu không tìm thấy payment thì trả về
        }

        payment.paymentStatus = "Shipping";
        payment.paymentDate = new Date();
        await payment.save();

        const cart = await db.Cart.findByPk(payment.cartId);
        if (!cart) {
          result.return_code = 0;
          result.return_message = "Cart not found";
          return res.json(result); // Nếu không tìm thấy cart thì trả về
        }

        cart.state = "completed";
        await cart.save(); // Cập nhật trạng thái giỏ hàng

        const cartDetails = await db.CartDetail.findAll({
          where: { cartId: cart.id },
        });

        console.log("Cart details:", cartDetails);

        if (!cartDetails || cartDetails.length === 0) {
          throw new Error("No cart details found");
        }

        for (const item of cartDetails) {
          console.log(
            `Processing item ${item.productId} with size ${item.size}`
          );

          const variant = await db.ProductVariant.findOne({
            where: { productId: item.productId, size: item.size },
          });

          if (!variant) {
            throw new Error(
              `Variant not found for product ${item.productId} with size ${item.size}`
            );
          }

          // Log the current stock and sold values before updating
          console.log(`Current stock: ${variant.stock}, sold: ${variant.sold}`);

          // Kiểm tra stock
          if (variant.stock < item.quantity) {
            throw new Error(
              `Insufficient stock for variant (Size: ${variant.size})`
            );
          }

          // Cập nhật stock và sold
          variant.stock -= item.quantity;
          variant.sold += item.quantity;

          // Log after updating
          console.log(
            `Updated stock: ${variant.stock}, updated sold: ${variant.sold}`
          );

          await variant.save(); // Lưu lại variant
        }

        result.return_code = 1;
        result.return_message = "success";
      } else {
        result.return_code = 0;
        result.return_message = "Payment failed";

        // Cập nhật trạng thái thanh toán thất bại
        const payment = await db.Payment.findOne({
          where: { transactionId: app_trans_id },
        });
        if (payment) {
          payment.paymentStatus = "Failed";
          await payment.save();
        }
      }
    }

    res.json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;

    const whereCondition = { userId: req.user.id };
    if (status) {
      whereCondition.paymentStatus = status; // Lọc theo trạng thái
    }

    const orders = await db.Payment.findAndCountAll({
      where: whereCondition,
      include: {
        model: db.Cart,
        as: "cart",
      },
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["paymentDate", "DESC"]], // Sắp xếp theo ngày gần nhất
    });

    return res.status(200).json({
      success: true,
      orders: orders.rows,
      totalOrders: orders.count,
      totalPages: Math.ceil(orders.count / limit),
      currentPage: parseInt(page),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const getDetailOrder = async (req, res) => {
  try {
    const { oid } = req.params;

    const order = await db.Payment.findOne({
      where: { id: oid, userId: req.user.id }, // Kiểm tra quyền
      include: {
        model: db.Cart,
        as: "cart",
        include: {
          model: db.CartDetail, // Bao gồm sản phẩm trong giỏ
          as: "items",
        },
      },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found or unauthorized access",
      });
    }

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const getAllOrdersForAdmin = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, userId } = req.query;

    // Validate input
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    if (isNaN(pageNum) || pageNum <= 0 || isNaN(limitNum) || limitNum <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid page or limit value",
      });
    }

    // Build search condition
    const whereCondition = {};
    if (status) {
      whereCondition.paymentStatus = status;
    }
    if (userId) {
      whereCondition.userId = userId;
    }

    // Query the database
    const orders = await db.Payment.findAndCountAll({
      where: whereCondition,
      include: {
        model: db.Cart,
        as: "cart",
        include: {
          model: db.CartDetail,
          as: "details",
          attributes: ["id", "productId", "quantity", "price"], // Select only necessary fields
        },
        attributes: ["id", "state"], // Select only necessary fields for Cart
      },
      attributes: ["id", "amount", "paymentDate", "paymentStatus", "userId"], // Select only necessary fields for Payment
      limit: limitNum,
      offset: (pageNum - 1) * limitNum,
      order: [["paymentDate", "DESC"]],
    });

    // Return response
    return res.status(200).json({
      success: true,
      data: {
        orders: orders.rows,
        meta: {
          totalOrders: orders.count,
          totalPages: Math.ceil(orders.count / limitNum),
          currentPage: pageNum,
          limit: limitNum,
        },
      },
    });
  } catch (error) {
    // Handle errors
    if (error.name === "SequelizeDatabaseError") {
      return res.status(400).json({
        success: false,
        message: "Database query error",
        error: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { oid } = req.params;

    const payment = await db.Payment.findByPk(oid);

    if (!payment || payment.paymentMethod !== "Cash") {
      return res.status(404).json({
        success: false,
        message: "Order not found or invalid payment method",
      });
    }

    if (payment.paymentStatus === "Delivered") {
      return res.status(400).json({
        success: false,
        message: "Order is already marked as delivered",
      });
    }

    // Cập nhật trạng thái thành `Delivered`
    payment.paymentStatus = "Delivered";
    payment.paymentDate = new Date(); // Ghi nhận ngày thanh toán thực tế
    await payment.save();

    const cart = await db.Cart.findOne({ where: { id: payment.cartId } });
    if (cart) {
      cart.state = "completed"; // Đơn hàng đã hoàn tất
      await cart.save();
    }

    return res.status(200).json({
      success: true,
      message: "Order status updated to Delivered",
      payment,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const markOrderAsReceived = async (req, res) => {
  try {
    const { oid } = req.params;
    const order = await db.Payment.findOne({
      where: { id: oid, userId: req.user.id },
    });
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found or unauthorized access",
      });
    }
    if (order.paymentStatus !== "Shipping") {
      return res.status(400).json({
        success: false,
        message: "Order cannot be marked as received in its current state",
      });
    }
    order.paymentStatus = "Received"; // Cập nhật trạng thái
    order.receivedDate = new Date(); // Thêm ngày nhận (nếu cần)
    await order.save();

    return res.status(200).json({
      success: true,
      message: "Order marked as received successfully",
      order,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const cancelOrder = async (req, res) => {
  try {
    const { oid } = req.params;

    const payment = await db.Payment.findByPk(oid);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    if (payment.state !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Order cannot be canceled at this stage",
      });
    }

    // Kiểm tra phương thức thanh toán
    if (payment.paymentMethod === "zalopay") {
      // Gọi API hoàn tiền từ ZaloPay
      const refundResponse = await zalopayRefund(
        payment.transactionId,
        payment.totalPrice
      );

      if (refundResponse.return_code !== 1) {
        return res.status(500).json({
          success: false,
          message: "Failed to process refund. Please contact support.",
        });
      }
    }

    // Cập nhật trạng thái đơn hàng
    payment.state = "canceled";
    await payment.save();

    return res.status(200).json({
      success: true,
      message: "Order has been canceled",
      order: payment,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const zalopayRefund = async (transactionId, refundAmount) => {
  try {
    const response = await axios.post(
      "https://sandbox.zalopay.vn/v001/refund",
      {
        app_id: config.app_id,
        app_key: config.key1,
        transaction_id: transactionId,
        refund_amount: refundAmount,
      }
    );

    return response.data;
  } catch (error) {
    console.error("ZaloPay Refund Error:", error.message);
    return { success: false };
  }
};

module.exports = {
  createPayment,
  callBack,
  getAllOrders,
  getDetailOrder,
  getAllOrdersForAdmin,
  updateOrderStatus,
  markOrderAsReceived,
  cancelOrder,
};
