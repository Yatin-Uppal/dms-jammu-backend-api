const express = require("express");
const router = express.Router();
const userController = require("../controllers/usersController");
const authMiddleware = require("../middleware/authMiddleware");
const { body } = require("express-validator");


router.post(
    "/user",
    authMiddleware.verifyAccessToken,
    [
        body("first_name")
            .notEmpty().withMessage("First name is required")
            .isAlpha().withMessage("First name should contain only alphabets"),
        body("last_name")
            .notEmpty().withMessage("Last name is required")
            .isAlpha().withMessage("Last name should contain only alphabets"),
        body("username")
            .notEmpty().withMessage("Username is required")
            .custom(value => !/\s/.test(value)).withMessage("Username should not contain spaces"),
        body("password")
            .isLength({ min: 8 }).withMessage("Password should be at least 8 characters")
            .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/)
            .withMessage("Password should contain at least one uppercase letter, one lowercase letter, one numeric character, and one special character"),
        body("role_id")
            .notEmpty()
            .withMessage("Role ID is required")
            .isInt()
            .withMessage("Role ID should be an integer"),
    ],
    userController.createUser
);

router.get(
    "/user",
    authMiddleware.verifyAccessToken,
    userController.usersList
)

router.get(
    "/user-list",
    // authMiddleware.verifyAccessToken,
    userController.allUsersList
)

router.put(
    "/user/:user_id",
    authMiddleware.verifyAccessToken,
    [
        body("first_name")
            .notEmpty().withMessage("First name is required")
            .isAlpha().withMessage("First name should contain only alphabets"),
        body("last_name")
            .notEmpty().withMessage("Last name is required")
            .isAlpha().withMessage("Last name should contain only alphabets"),
        body("username")
            .notEmpty().withMessage("Username is required")
            .custom(value => !/\s/.test(value)).withMessage("Username should not contain spaces"),
        body("role_id")
            .notEmpty()
            .withMessage("Role ID is required")
            .isInt()
            .withMessage("Role ID should be an integer"),
    ],
    userController.updateUser
)

router.delete(
    "/user/:user_id",
    authMiddleware.verifyAccessToken,
    userController.deleteUser

)

router.patch(
    "/user/:user_id",
    authMiddleware.verifyAccessToken,
    userController.blockUnblockUser

)


module.exports = router;
