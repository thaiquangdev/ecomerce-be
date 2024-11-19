const db = require("../models");

const createAddress = async (req, res) => {
  try {
    const { id: userId } = req.user;
    const {
      street,
      city,
      state,
      zipCode,
      country,
      type,
      phoneNumber,
      isDefault = false, // Giá trị mặc định
    } = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (!street || !city || !state || !zipCode || !country || !phoneNumber) {
      return res.status(400).json({
        success: false,
        message:
          "All fields are required: street, city, state, zipCode, country, phoneNumber",
      });
    }

    // Kiểm tra xem địa chỉ này đã tồn tại hay chưa
    const existingAddress = await db.Address.findOne({
      where: {
        userId,
        street,
        city,
        state,
        zipCode,
        country,
      },
    });

    if (existingAddress) {
      return res.status(400).json({
        success: false,
        message: "Address already exists. Cannot add duplicate address.",
      });
    }

    // Nếu là mặc định, cập nhật các địa chỉ khác không còn là mặc định
    if (isDefault) {
      await db.Address.update({ isDefault: false }, { where: { userId } });
    }

    // Tạo địa chỉ mới
    const newAddress = await db.Address.create({
      userId,
      street,
      city,
      state,
      zipCode,
      country,
      type,
      phoneNumber,
      isDefault,
    });

    return res.status(201).json({
      success: true,
      message: "Address created successfully",
      newAddress,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

module.exports = createAddress;
