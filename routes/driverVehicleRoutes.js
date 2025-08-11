// routes/driverVehicleRoutes.js

const express = require("express");
const { body } = require("express-validator");
const router = express.Router();
const driverVehicleController = require("../controllers/driverVehicleController");
const authMiddleware = require("../middleware/authMiddleware");
router.post(
  "/driver-vehicle/store",
  authMiddleware.verifyAccessToken,
  [
    body("vehicle_number_ba_number")
      .trim()
      .notEmpty()
      .withMessage("vehicle_number_ba_number is required")
      .isString()
      .isLength({ max: 20 })
      .withMessage(
        "vehicle_number_ba_number must be a string of maximum 20 characters"
      ),
    body("fmn_id")
      .notEmpty()
      .withMessage("Formation is required")
      .isInt()
      .withMessage("Formation ID is required."),
    body("series")
      .trim()
      .notEmpty()
      .withMessage("series is required")
      .isString(),
  ],
  driverVehicleController.saveDriverVehicleDetails
);



// Fetch driver list
router.get(
  "/driver-list",
  authMiddleware.verifyAccessToken,
  driverVehicleController.getDriverList
);

// Update driver details
router.put(
  "/driver-vehicle/:driver_Id",
  authMiddleware.verifyAccessToken,
  [
    body("vehicle_number_ba_number")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("vehicle_number_ba_number is required")
      .isString()
      .isLength({ max: 20 })
      .withMessage(
        "vehicle_number_ba_number must be a string of maximum 20 characters"
      ),
  ],
  driverVehicleController.updateDriverVehicle
);

// driver records get who do not have the LTS assigned
router.get(
  "/drivers-without-lts",
  authMiddleware.verifyAccessToken,
  driverVehicleController.getDriverListNotLts
);

router.get(
  "/driver-details/:driver_Id",
  authMiddleware.verifyAccessToken,
  driverVehicleController.getDriverDataBYID
);

// to get the exact match of search for vehicle no. as we want to show the prefilled details while adding driver

router.get(
  "/driver-vehicle-details",
  authMiddleware.verifyAccessToken,
  driverVehicleController.getDriverVehicleDetail
);

// delete driver data routes.
router.delete(
  "/soft-delete-driver",
  authMiddleware.verifyAccessToken,
  driverVehicleController.deleteDriverData)

// Update checkout details of a prticular Vehicle
router.put(
  "/driver-chcekout",
  authMiddleware.verifyAccessToken,
  driverVehicleController.driverCheckout
);

// get driver list to print multiple data

router.get(
  "/vehicle/list/series",
  authMiddleware.verifyAccessToken,
  driverVehicleController.getDriverListMultiplePrint
);
module.exports = router;
