const express = require("express");
const router = express.Router();
const roleController = require("../controllers/rolesController");
const authMiddleware = require("../middleware/authMiddleware");

router.get(
    "/roles",
    authMiddleware.verifyAccessToken,
    roleController.getRoleList
)
module.exports = router;