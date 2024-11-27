const db = require("../models");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const transporter = require("../configs/mail.config");
const { Op } = require("sequelize");

const changePassword = async (req, res, next) => {
  try {
    const { id } = req.user;
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "OldPassword and newPassword is require",
      });
    }
    const user = await db.User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User is not found",
      });
    }
    const comparePassword = await bcrypt.compare(oldPassword, user.password);
    if (!comparePassword) {
      return res.status(400).json({
        success: false,
        message: "password is not match",
      });
    }
    user.password = newPassword;
    await user.save();
    return res.status(200).json({
      success: true,
      message: "Change password is successful",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const getUser = async (req, res) => {
  try {
    const { id } = req.user;
    const user = await db.User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User is not found",
      });
    }
    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const getUsers = async (req, res) => {
  try {
    const { name } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 8;
    const offset = (page - 1) * limit;

    const whereCondition = { roleId: 2 };
    if (name) {
      whereCondition.fullName = { [db.Sequelize.Op.like]: `%${name}%` };
    }

    // Sử dụng findAndCountAll để kết hợp findAll và count
    const { rows: users, count: totalUsers } = await db.User.findAndCountAll({
      where: whereCondition,
      limit,
      offset,
    });

    return res.status(200).json({
      success: true,
      users,
      totalUsers,
      currentPage: page,
      limit,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await db.User.findByPk(req.params.uid, {
      include: {
        model: db.address,
        as: "address",
      },
    });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User is not found",
      });
    }
    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      mesage: "Internal server error",
      error: error.message,
    });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Email is required" });
    }

    const user = await db.User.findOne({ where: { email } });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Email not found" });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const expire = Date.now() + 15 * 60 * 1000; // 15 minutes

    user.passwordResetToken = hashedToken;
    user.passwordResetExpiry = expire;
    await user.save();

    const url = `${process.env.CLIENT_URL}/reset-password/${token}`;
    const mailOptions = {
      from: '"YourApp Support" <support@yourapp.com>',
      to: email,
      subject: "Password Reset Request",
      html: `<p>To reset your password, click the link below. This link will expire in 15 minutes.</p><a href="${url}">Reset Password</a>`,
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({
      success: true,
      message: "Reset link sent. Please check your email.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!newPassword) {
      return res.status(400).json({
        success: false,
        message: "New password is required.",
      });
    }
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await db.User.findOne({
      where: {
        passwordResetToken: hashedToken,
        passwordResetExpiry: { [Op.gt]: Date.now() },
      },
    });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Token invalid or expired.",
      });
    }
    const hashPassword = await bcrypt.hash(newPassword, 12);
    user.password = hashPassword;
    user.passwordResetToken = null;
    user.passwordResetExpiry = null;
    await user.save();
    return res.status(200).json({
      success: true,
      message: "Reset password is successful",
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
  changePassword,
  getUser,
  getUsers,
  getUserById,
  forgotPassword,
  resetPassword,
};
