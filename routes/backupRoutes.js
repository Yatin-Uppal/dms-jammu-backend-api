const express = require("express");
const router = express.Router();
const backupController = require("../controllers/backupController");
const authMiddleware = require("../middleware/authMiddleware");

router.post(
    "/backup",
    authMiddleware.verifyAccessToken,
    backupController.createBackup
)
router.get(
    "/backup",
    authMiddleware.verifyAccessToken,
    backupController.getBackupList
)
module.exports = router;