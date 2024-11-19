const express = require("express");
const {
  createRole,
  getAllRoles,
  getRoleById,
  updateRole,
  deleteRole,
} = require("../controllers/role.controller");

const router = express.Router();

router.post("/create-role", createRole);
router.get("/get-roles", getAllRoles);
router.get("/get-role/:rid", getRoleById);
router.put("/update-role/:rid", updateRole);
router.delete("delete-role/:rid", deleteRole);

module.exports = router;
