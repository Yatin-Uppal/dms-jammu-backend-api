const express = require("express");
const { body } = require("express-validator");
const router = express.Router();
const gateCheckoutController = require("../controllers/gateCheckoutController");
const authMiddleware = require("../middleware/authMiddleware");

// Define your API endpoints with validation middleware
router.post(
    "/gate-checkout",
    authMiddleware.verifyAccessToken,
    gateCheckoutController.handleBulkGateCheckoutData
  );

module.exports = router;
