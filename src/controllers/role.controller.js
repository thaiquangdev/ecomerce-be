const db = require("../models");

const createRole = async (req, res) => {
  try {
    const { roleName, description, isActive = true } = req.body; // Thêm isActive với giá trị mặc định là true

    if (!roleName) {
      return res.status(400).json({
        success: false,
        message: "roleName is required",
      });
    }

    const alreadyRole = await db.Role.findOne({ where: { roleName } });
    if (alreadyRole) {
      return res.status(400).json({
        success: false,
        message: "role is already",
      });
    }

    const newRole = await db.Role.create({
      roleName,
      description,
    });

    return res.status(201).json({
      success: true,
      message: "Create role is successful",
      role: newRole,
    });
  } catch (error) {
    console.error(error); // Ghi lại lỗi để dễ dàng kiểm tra
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const getAllRoles = async (req, res) => {
  try {
    const roles = await db.Role.findAll();
    return res.status(200).json({
      success: true,
      roles,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const getRoleById = async (req, res) => {
  try {
    const { rid } = req.params;
    const role = await db.Role.findByPk(rid, {
      include: {
        model: db.User,
        as: "users",
      },
    });
    if (!role) {
      return res.status(404).json({
        success: false,
        message: "Role is not found",
      });
    }
    return res.status(200).json({
      success: true,
      role,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const updateRole = async (req, res) => {
  try {
    const { rid } = req.params;
    const { roleName, description } = req.body;
    const role = await db.Role.findByPk(rid, {
      include: {
        model: db.User,
        as: "users",
      },
    });
    if (!role) {
      return res.status(404).json({
        success: false,
        message: "Role is not found",
      });
    }
    role.roleName = roleName;
    role.description = description;
    await role.save();
    return res.status(200).json({
      success: true,
      message: "Update role is successful",
      role,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const deleteRole = async (req, res) => {
  try {
    const { rid } = req.params;
    const role = await db.Role.findByPk(rid, {
      include: {
        model: db.User,
        as: "users",
      },
    });
    if (!role) {
      return res.status(404).json({
        success: false,
        message: "Role is not found",
      });
    }
    await role.destroy();
    return res.status(200).json({
      success: true,
      message: "Delete is successful",
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
  createRole,
  getAllRoles,
  getRoleById,
  updateRole,
  deleteRole,
};
