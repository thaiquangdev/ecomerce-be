const jwt = require("jsonwebtoken");
const db = require("../models");

const protect = async (req, res, next) => {
  try {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      // Lấy token từ header
      token = req.headers.authorization.split(" ")[1];

      // Giải mã token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Tìm người dùng theo decoded id
      const user = await db.User.findByPk(decoded.id);

      // Nếu không tìm thấy user, trả về lỗi
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // Lưu thông tin user vào request để sử dụng sau
      req.user = user;
      next();
    } else {
      return res.status(401).json({
        success: false,
        message: "Not authorized, token missing",
      });
    }
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid token",
      error: error.message,
    });
  }
};

module.exports = protect;
