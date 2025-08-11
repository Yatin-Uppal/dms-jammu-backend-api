const express = require("express");
const { body } = require("express-validator");
const router = express.Router();
const driverVehicleSyncController = require("../controllers/syncDriverVehicleController");
const authMiddleware = require("../middleware/authMiddleware");

// Fetch driver list
router.get(
  "/driver_list_not_loaded",
  authMiddleware.verifyAccessToken,
  driverVehicleSyncController.getDriverListNotLoaded
);

// Define your API endpoints with validation middleware
router.post(
    "/sync-driver-data",
    authMiddleware.verifyAccessToken,
    driverVehicleSyncController.bulkDriverData
  );

module.exports = router;
