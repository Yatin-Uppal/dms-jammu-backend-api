const bcrypt = require("bcryptjs");
const db = require("../models");
const jwt = require("jsonwebtoken");
const responseHandler = require("../helpers/responseHandler");
const { validationResult } = require("express-validator");
const authMiddleware = require("../middleware/authMiddleware");
const { Op } = require("sequelize");

exports.login = async (req, res) => {
  // Validation
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return responseHandler(req,res, 400, false, "Validation errors", {
      errors: errors.array(),
    }, "");
  }

  const { username, password } = req.body;
  try {
    const user = await db.User.findOne({
      where: { username,password }
    });
    if (!user) {
      return responseHandler(req,res, 404, false, "Invalid credentials", {}, "");
    }
    if (user.is_blocked) {
      return responseHandler(req,res, 401, false, "Access Denied, contact DCC Admin.", {}, "");
    }
    
    const role = await db.Role.findOne({ where: { id: user.role_id } });

    responseHandler(req,res, 200, true, "", {
      user_id: user.id,
      roleData: {
        id: role.id,
        role: role.role,
      },
      first_name: user.first_name,
      last_name: user.last_name,
      username: user.username,
    }, "Login Successful.");
  } catch (error) {
    responseHandler(req,res, 500, false, "Server error", {}, "");
  }
};


