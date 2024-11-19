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
      callback_url: "https://9f98-171-238-153-195.ngrok-free.app/callback",
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
      let dataJson = JSON.parse(dataStr, config.key2);

      console.log(dataJson);

      if (dataJson.zp_trans_id) {
        const { app_trans_id, amount, user_id, payment_gateway } = dataJson;

        console.log(app_trans_id);

        const payment = await db.Payment.findOne({
          where: { transactionId: app_trans_id },
        });

        if (payment) {
          payment.paymentStatus = "Success";
          payment.paymentDate = new Date();
          await payment.save();
        }

        result.return_code = 1;
        result.return_message = "success";
      } else {
        result.return_code = 0;
        result.return_message = "Payment failed";
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

module.exports = { createPayment, callBack };
