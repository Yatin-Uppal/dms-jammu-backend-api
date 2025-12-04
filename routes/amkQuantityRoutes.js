const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const amkQuantityControllers = require("../controllers/amkQuantityControllers");
const { body } = require("express-validator");
const fs = require("fs");
const path = require('path');
const multer = require('multer');

// Configure multer for file upload
const uploadDir = 'uploads/amk_excel_files';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Setup disk storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Create unique filename with original extension
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + extension);
    }
});

const upload = multer({ storage: storage });

router.post(
  "/manage_amk_quantity/store",
  authMiddleware.verifyAccessToken,
  [
    body("amk_number")
      .notEmpty()
      .withMessage("Amk Number is required.")
      .isString()
      .withMessage("AMK Number must be an string.")
      .isLength({ max: 200 })
      .withMessage("AMK Number must be a string of maximum 100 characters"),
    body("location_33_fad")
      .notEmpty()
      .withMessage("Location is required.")
      .isString()
      .withMessage("Location must be an string.")
      .isLength({ max: 200 })
      .withMessage("Location must be a string of maximum 100 characters"),
    body("total_quantity").notEmpty().withMessage("Quatity is required."),
  ],

  amkQuantityControllers.storeAMKQuantity
);

router.put(
  "/manage_amk_quantity/update/:amk_id",
  authMiddleware.verifyAccessToken,
  [
    body("amk_number")
      .optional()
      .notEmpty()
      .withMessage("Amk Number is required.")
      .isString()
      .withMessage("AMK Number must be an string.")
      .isLength({ max: 200 })
      .withMessage("AMK Number must be a string of maximum 100 characters"),
    body("location_33_fad")
      .optional()
      .notEmpty()
      .withMessage("Location is required.")
      .isString()
      .withMessage("Location must be an string.")
      .isLength({ max: 200 })
      .withMessage("Location must be a string of maximum 100 characters"),
    body("total_quantity")
      .optional()
      .notEmpty()
      .withMessage("Quatity is required."),

  ],

  amkQuantityControllers.updateAMKQuantity
);

router.delete(
  "/manage_amk_quantity/delete/:amk_id",
  authMiddleware.verifyAccessToken,
  amkQuantityControllers.deleteAMKQuantity
);

router.post(
  "/manage_amk_quantity/import-data",
  authMiddleware.verifyAccessToken,
  upload.single('file'),
  amkQuantityControllers.uploadAMKQuantity
);

router.post(
    "/manage_amk_quantity/import-data-new",
    authMiddleware.verifyAccessToken,
    upload.single('file'),
    amkQuantityControllers.uploadAMKQuantityNew
);

router.get(
    "/manage_amk_quantity/download_excel_format",
    authMiddleware.verifyAccessToken,
    amkQuantityControllers.downloadExcelFormat
);

router.get(
    "/manage_amk_quantity/download_excel_sheet/:sheet_id",
    authMiddleware.verifyAccessToken,
    amkQuantityControllers.downloadSheetById
);

router.get(
  "/manage_amk_quantity/list",
  authMiddleware.verifyAccessToken,
  amkQuantityControllers.getAMKQuantity
);

router.get(
    "/manage_amk_quantity/sheet-upload-history",
    authMiddleware.verifyAccessToken,
    amkQuantityControllers.sheetUploadHistory
);

module.exports = router;
