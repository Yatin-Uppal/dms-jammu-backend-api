const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const authController = require("../controllers/authController");

router.post(
  "/login",
  [
    body("username").trim().notEmpty().withMessage("Username is required") .isLength({ max: 100 })
    .withMessage("username must be a string of maximum 100 characters"),
    body("password").trim().notEmpty().withMessage("Password is required") .isLength({ max: 100 })
    .withMessage("password must be a string of maximum 100 characters"),
  ],
  authController.login
);



module.exports = router;
