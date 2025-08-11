const express = require("express");
const { body } = require("express-validator");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const importDataController = require("../controllers/importDataController");
const multer = require('multer');


// Configure multer for file upload
const storage = multer.memoryStorage(); // Store files in memory
const upload = multer({ storage: storage });
router.post(
  "/import-data",
  authMiddleware.verifyAccessToken,upload.single('file'),
  importDataController.excelImportData
);

module.exports = router;
