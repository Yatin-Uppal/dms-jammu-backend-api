// routes/logRoutes.js
const express = require("express");
const router = express.Router();
const logController = require("../controllers/logController");
const authMiddleware = require("../middleware/authMiddleware");
// Define your log routes
router.get("/logs", authMiddleware.verifyAccessToken, logController.getLogs);

module.exports = router;
