const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { body } = require("express-validator");
const { SetSeries, GetAllSeriesByUserId , UpdateSeriesData, GetSeriesBatchByUserId} = require("../controllers/manageSeriesControllers");

router.post(
  "/manage_series/store",
  authMiddleware.verifyAccessToken,
  [
    // Validate 'time'
    body("time")
      .notEmpty()
      .withMessage("Time is required.")
      .isInt({ min: 1 })
      .withMessage("Time must be a positive integer."),

    // Validate 'interval'
    body("interval")
      .notEmpty()
      .withMessage("Interval is required.")
      .isInt({ min: 1, max: 24 })
      .withMessage("Interval must be an integer between 1 and 24."),

    // Validate 'startDate' with time
    body("startDate")
      .notEmpty()
      .withMessage("Start date and time are required.")
      .isISO8601()
      .withMessage("Start date must be in ISO8601 format (YYYY-MM-DDTHH:mm:ss)."),

    // Validate 'endDate' with time
    body("endDate")
      .notEmpty()
      .withMessage("End date and time are required.")
      .isISO8601()
      .withMessage("End date must be in ISO8601 format (YYYY-MM-DDTHH:mm:ss).")
      .custom((value, { req }) => {
        if (new Date(value) <= new Date(req.body.startDate)) {
          throw new Error("End date must be after start date.");
        }
        return true;
      }),
  ],
  SetSeries
);


router.patch(
  "/manage_series/update",
  authMiddleware.verifyAccessToken,
  [
    // Validate 'time'
    body("time")
      .notEmpty()
      .withMessage("Time is required.")
      .isInt({ min: 1 })
      .withMessage("Time must be a positive integer."),

    // Validate 'interval'
    body("interval")
      .notEmpty()
      .withMessage("Interval is required.")
      .isInt({ min: 1, max: 24 })
      .withMessage("Interval must be an integer between 1 and 24."),

    // Validate 'startDate' with time
    body("startDate")
      .notEmpty()
      .withMessage("Start date and time are required.")
      .isISO8601()
      .withMessage("Start date must be in ISO8601 format (YYYY-MM-DDTHH:mm:ss)."),

    // Validate 'endDate' with time
    body("endDate")
      .notEmpty()
      .withMessage("End date and time are required.")
      .isISO8601()
      .withMessage("End date must be in ISO8601 format (YYYY-MM-DDTHH:mm:ss).")
      .custom((value, { req }) => {
        if (new Date(value) <= new Date(req.body.startDate)) {
          throw new Error("End date must be after start date.");
        }
        return true;
      }),
  ],
  UpdateSeriesData
);


router.get("/manage_series/series", 
    authMiddleware.verifyAccessToken, 
    GetAllSeriesByUserId)

router.get("/manage_series/series_batch", 
  authMiddleware.verifyAccessToken, 
  GetSeriesBatchByUserId)

module.exports = router;
