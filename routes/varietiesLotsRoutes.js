const express = require("express");
const router = express.Router();
const varietiesLotsController = require("../controllers/varietiesLotsController")
const authMiddleware = require("../middleware/authMiddleware");
const { body, param } = require("express-validator");

router.post(
    "/lot-qr-details/generate-lot-qr",
    authMiddleware.verifyAccessToken,
    [
        body().isArray({ min: 1 }).withMessage("Atleast one LOT is required for the variety."),

        body("*.skt_variety_id")
            .exists().withMessage("Variety ID is required")
            .bail()
            .isInt().withMessage("Variety ID must be an integer"),

        body("*.lot_number")
            .exists().withMessage("LOT number is required")
            .bail()
            .isString().withMessage("LOT number must be a string")
            .trim(),

        body("*.lot_quantity")
            .exists().withMessage("LOT quantity is required")
            .bail()
            .isFloat({ gt: 0 }).withMessage("LOT quantity must be a positive number")
    ],
    varietiesLotsController.createVarietyLots
);

router.get(
    "/lot-qr-details-list",
    authMiddleware.verifyAccessToken,
    varietiesLotsController.getLotDetailsList
)
router.get(
    "/complete-lts-list",
    authMiddleware.verifyAccessToken,
    varietiesLotsController.getAllLtsList
)

router.get(
    "/lot-qr-details/:lts_id",
    authMiddleware.verifyAccessToken,
    [
        param("lts_id")
            .notEmpty()
            .withMessage("LTS ID is required")
            .isInt()
            .withMessage("LTS ID must be an integer"),
    ],
    varietiesLotsController.getLtsDetailsById
)

router.put(
    "/lot-qr-details/update-lot-qr/:id",
    authMiddleware.verifyAccessToken,
    [
        param("id")
            .notEmpty()
            .withMessage("Variety ID is required"),

        body().isArray({ min: 1 }).withMessage("Atleast one LOT is required for the variety."),

        body("*.skt_variety_id")
            .exists().withMessage("Variety ID is required")
            .bail()
            .isInt().withMessage("Variety ID must be an integer"),

        body("*.lot_number")
            .exists().withMessage("LOT number is required")
            .bail()
            .isString().withMessage("LOT number must be a string")
            .trim(),

        body("*.lot_quantity")
            .exists().withMessage("LOT quantity is required")
            .bail()
            .isFloat({ gt: 0 }).withMessage("LOT quantity must be a positive number")
    ],
    varietiesLotsController.updateVarietyLots
);

router.delete("/delete-lots-qr-details/:id", 
    authMiddleware.verifyAccessToken,
    [   param("id")
            .notEmpty()
            .withMessage("Variety ID is required")
            .isInt()
            .withMessage("Variety ID must be an integer"),
    ],
    varietiesLotsController.deleteVarietyLots)

module.exports = router;