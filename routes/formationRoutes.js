const express = require("express");
const router = express.Router();
const formationController = require("../controllers/formationDetails")
const authMiddleware = require("../middleware/authMiddleware");
const { body } = require("express-validator");

router.post(
    "/formation/save",
    authMiddleware.verifyAccessToken,
    [
        body("formation_name")
            .notEmpty()
            .withMessage("Formation name is required")
            .isString()
            .withMessage("Formation name must be a string"),
        body("unit_ids")
            .optional()
            .isArray()
            .withMessage("unit_ids must be an array of integers"),
        body("unit_ids.*")
            .optional()
            .isInt()
            .withMessage("Each unit_id must be an integer"),
    ],
    formationController.createFormation
)
router.get(
    "/formation-list",
    authMiddleware.verifyAccessToken,
    formationController.getFormationList
)
router.get(
    "/formation-complete-list",
    authMiddleware.verifyAccessToken,
    formationController.getFormationCompleteList
)
router.put(
    "/formation/:formation_id",
    authMiddleware.verifyAccessToken,
    [
        body("formation_name")
            .notEmpty()
            .withMessage("Formation name is required")
            .isString()
            .withMessage("Formation name must be a string"),
        body("unit_ids")
            .optional()
            .isArray()
            .withMessage("unit_ids must be an array of integers"),
        body("unit_ids.*")
            .optional()
            .isInt()
            .withMessage("Each unit_id must be an integer"),
    ],
    formationController.updateForomation
)
router.delete("/formation/:formation_id", authMiddleware.verifyAccessToken, formationController.deleteFormation)

module.exports = router;