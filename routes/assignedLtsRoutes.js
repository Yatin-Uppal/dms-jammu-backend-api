// routes/assignedLtsRoutes.js

const express = require("express");
const router = express.Router();
const assignedLtsController = require("../controllers/assignedLtsController");
const authMiddleware = require("../middleware/authMiddleware");
const { body } = require("express-validator");
router.post(
  "/assign-lts",
  authMiddleware.verifyAccessToken,
  [
    body("driver_vehicle_detail_id")
      .notEmpty()
      .withMessage("driver_vehicle_detail_id is required")
      .isInt()
      .withMessage("driver_vehicle_detail_id must be an integer"),
    body("lts_issue_voucher_detail_id")
      .notEmpty()
      .withMessage("lts_issue_voucher_detail_id is required")
      .isInt()
      .withMessage("lts_issue_voucher_detail_id must be an integer"),
    body("user_id")
      .notEmpty()
      .withMessage("user_id is required")
      .isInt()
      .withMessage("user_id must be an integer"),
  ],

  assignedLtsController.assignLtsDetails
);

// Update Assigned LTS Details
// router.put(
//   "/assign-lts/load",
//   authMiddleware.verifyAccessToken,
//   [
//     body("user_id")
//       .notEmpty()
//       .withMessage("user_id is required")
//       .isInt()
//       .withMessage("user_id must be an integer"),
//     body("is_loaded")
//       .notEmpty()
//       .withMessage("is_loaded is required")
//       .isIn([0, 1])
//       .withMessage("is_loaded must be either 0 or 1"),
//     body("lts_varitiy_id")
//       .notEmpty()
//       .withMessage("lts_varitiy_id is required")
//       .isArray()
//       .withMessage("lts_varitiy_id must be an array")
//       .custom((value) => value.every(Number.isInteger))
//       .withMessage("lts_varitiy_id array must contain integers"),
//   ],
//   assignedLtsController.updateAssignedLtsDetails
// );

router.delete(
  "/assign-lts/:id",
  authMiddleware.verifyAccessToken,
  assignedLtsController.deleteAssignedLtsDetail
);
router.put(
  "/assign-lts/load",
  authMiddleware.verifyAccessToken,
  [
    body("lts_varitiy_data")
      .notEmpty()
      .withMessage("lts_varitiy_data is required")
      .isArray()
      .withMessage("lts_varitiy_data must be an array"),
  ],
  assignedLtsController.updateMultipleLTSVarities
);

module.exports = router;
