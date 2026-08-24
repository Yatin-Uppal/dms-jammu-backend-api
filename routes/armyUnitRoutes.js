const express = require("express");
const router = express.Router();
const armyUnitController = require("../controllers/armyUnitController");
const authMiddleware = require("../middleware/authMiddleware");
const { body, param, query } = require("express-validator");
const multer = require("multer");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

/**
 * Save unit (single or comma-separated)
 */
router.post(
  "/unit/save",
  authMiddleware.verifyAccessToken,
  [
    body("unit_name")
      .notEmpty()
      .withMessage("Unit name is required")
      .isString()
      .withMessage("Unit name must be a string"),
    body("fmn_id")
      .optional({ nullable: true })
      .custom((value) => {
        if (value === null || value === undefined || value === "") return true;
        if (Number.isInteger(Number(value)) && Number(value) >= 1) return true;
        throw new Error("Formation ID must be a positive integer or null");
      }),
  ],
  armyUnitController.createUnit
);

/**
 * Get paginated unit list
 */
router.get(
  "/unit-list",
  authMiddleware.verifyAccessToken,
  armyUnitController.getUnitList
);

/**
 * Get all units for selection/dropdowns
 */
router.get(
  "/unit-complete-list",
  authMiddleware.verifyAccessToken,
  armyUnitController.getUnitCompleteList
);

/**
 * Update unit details
 */
router.put(
  "/unit/:unit_id",
  authMiddleware.verifyAccessToken,
  [
    param("unit_id")
      .notEmpty()
      .withMessage("Unit ID is required")
      .isInt()
      .withMessage("Unit ID must be an integer"),
    body("unit_name")
      .optional()
      .isString()
      .withMessage("Unit name must be a string"),
    body("fmn_id")
      .optional({ nullable: true })
      .custom((value) => {
        if (value === null || value === undefined || value === "") return true;
        if (Number.isInteger(Number(value)) && Number(value) >= 1) return true;
        throw new Error("Formation ID must be a positive integer or null");
      }),
  ],
  armyUnitController.updateUnit
);

/**
 * Delete unit (soft-delete)
 */
router.delete(
  "/unit/:unit_id",
  authMiddleware.verifyAccessToken,
  [
    param("unit_id")
      .notEmpty()
      .withMessage("Unit ID is required")
      .isInt()
      .withMessage("Unit ID must be an integer"),
  ],
  armyUnitController.deleteUnit
);

/**
 * Bulk upload units via Excel
 */
router.post(
  "/unit/bulk-upload",
  authMiddleware.verifyAccessToken,
  upload.single("file"),
  armyUnitController.bulkUploadUnits
);

module.exports = router;
