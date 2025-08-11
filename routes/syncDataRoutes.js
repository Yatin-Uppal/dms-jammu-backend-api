const express = require("express");
const router = express.Router();
const syncDataController = require("../controllers/syncDataController");
const authMiddleware = require("../middleware/authMiddleware");
const { body, validationResult } = require("express-validator");
// Define validation middleware for a single LTS variety data item
const validateLTSVarietyData = [
    body("loaded_by").isInt().withMessage("Loaded by must be an integer"),
    body("lts_variety_id").isInt().withMessage("LTS variety ID must be an integer"),
    body("lot_number").isString().withMessage("Lot number must be a string"),
  ];
  
  // Define validation middleware for a single driver data item
  const validateDriverData = [
    body("driver_id").isInt().withMessage("Driver ID must be an integer"),
    body("begin_by").isInt().withMessage("Begin by must be an integer"),
    body("end_by").isInt().withMessage("End by must be an integer"),
    body("assigned_by").isInt().withMessage("Assigned by must be an integer"),
    body("lts_variety_data").isArray().withMessage("LTS variety data must be an array"),
    body("lts_variety_data.*").custom((value) => {
      // Ensure each LTS variety data item passes the validation rules
      const errors = validationResult(value);
      if (!errors.isEmpty()) {
        throw new Error("Invalid LTS variety data");
      }
      return true;
    }),
  ];
// Define your API endpoints with validation middleware
router.post(
    "/sync-152",
    [
      validateDriverData, // Apply driver data validation
      body("bulkDriverData").isArray().withMessage("Bulk driver data must be an array"),
    ],
    syncDataController.bulkDriverData
  );

module.exports = router;