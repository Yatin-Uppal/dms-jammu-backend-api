const express = require("express");
const router = express.Router();
const driverController = require("../controllers/driverController");
const { body } = require("express-validator");
const { param } = require('express-validator');

const authMiddleware = require("../middleware/authMiddleware");
// Fetch all details of driver, vehicle, and LTS assigned with status
router.get(
  "/record_details/:record_id",
  authMiddleware.verifyAccessToken,
  [

    param("record_id")
      .notEmpty()
      .withMessage("record_id is required")
      .isString()
      .isLength({ max: 100 })
      .withMessage("record_id must be a string of maximum 100 characters"),
  ],
  driverController.fetchDetails
);

router.get(
  "/record_details",
  authMiddleware.verifyAccessToken,
  driverController.fetchRecords
);

// get the records by series to print multiple driver data
router.get(
  "/record_details_series/:series?",
  authMiddleware.verifyAccessToken,
  driverController.fetchRecordsBySeries
);
// Define a route for downloading the Excel file
router.get(
  "/download_excel",
  authMiddleware.verifyAccessToken, // Adjust the middleware as needed
  driverController.downloadExcel
);


router.get(
  "/download_amk",
  authMiddleware.verifyAccessToken,
  driverController.downloadAmkreport
)
module.exports = router;
