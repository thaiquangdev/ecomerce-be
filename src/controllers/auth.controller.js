const db = require("../models");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const register = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;
    const emailExists = await db.User.findOne({ where: { email } });
    if (emailExists) {
      return res.status(400).json({
        success: false,
        message: "email is already",
      });
    }
    const hashPassword = await bcrypt.hash(password, 12);
    const newUser = await db.User.create({
      fullName,
      email,
      password: hashPassword,
      roleId: 2,
    });
    return res.status(201).json({
      success: true,
      message: "Register is successful",
      user: {
        id: newUser.id,
        fullName: newUser.fullName,
        email: newUser.email,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email && !password) {
      return res.status(400).json({
        success: false,
        message: "email and password is require",
      });
    }
    const user = await db.User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User is not found. Please register",
      });
    }
    const comparePassword = await bcrypt.compare(password, user.password);
    if (!comparePassword) {
      return res.status(400).json({
        success: false,
        message: "password is not match",
      });
    }
    const accessToken = generateAccessToken(user.id, user.email);
    const refreshToken = generateRefreshToken(user.id, user.email);

    await user.update({ refreshToken });

    res.cookie("refreshToken", refreshToken, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    });

    return res.status(200).json({
      success: true,
      token: accessToken,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const logout = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;
    if (!refreshToken) {
      return res.status(204).json({
        success: false,
        message: "No refreshToken in cookie",
      });
    }
    const user = await db.User.findOne({ where: { refreshToken } });
    if (!user) {
      res.clearCookie("refreshToken", {
        httpOnly: true,
      });
      return res.status(204).json({
        success: true,
        error: "User not found, but refreshToken remove from cookie",
      });
    }
    user.refreshToken = null;
    await user.save();
    res.clearCookie("refreshToken", {
      httpOnly: true,
    });
    return res.status(200).json({
      success: true,
      message: "Logout successful, refresh token removed",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const refreshAccessToken = async (req, res) => {
  try {
    // Lấy refreshToken từ cookie
    const { refreshToken } = req.cookies;

    // Kiểm tra xem refreshToken có tồn tại hay không
    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "No refreshToken in cookie",
      });
    }

    // Giải mã refreshToken
    const decode = jwt.verify(refreshToken, process.env.JWT_SECRET);

    // Tìm người dùng dựa trên refreshToken
    const user = await db.User.findOne({ where: { id: decode.id } });
    if (!user || user.refreshToken !== refreshToken) {
      res.clearCookie("refreshToken"); // Xóa cookie nếu không tìm thấy người dùng
      return res.status(401).json({
        success: false,
        message: "Invalid refreshToken, please log in again",
      });
    }

    // Tạo accessToken mới
    const newAccessToken = generateAccessToken(user.id, user.email);

    // Tạo refreshToken mới (nếu cần)
    const newRefreshToken = generateRefreshToken(user.id, user.email);

    // Cập nhật refreshToken mới vào cơ sở dữ liệu
    user.refreshToken = newRefreshToken;
    await user.save();

    // Gửi cookie refreshToken mới
    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 1 tuần
    });

    // Trả về accessToken mới
    return res.status(200).json({
      success: true,
      accessToken: newAccessToken,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const generateAccessToken = (id, email) => {
  return jwt.sign({ id, email }, process.env.JWT_SECRET, { expiresIn: "1d" });
};

const generateRefreshToken = (id, email) => {
  return jwt.sign({ id, email }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

module.exports = {
  register,
  login,
  logout,
  refreshAccessToken,
};
