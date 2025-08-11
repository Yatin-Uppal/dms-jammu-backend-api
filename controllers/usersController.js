const db = require("../models");
const responseHandler = require("../helpers/responseHandler");
const { validationResult } = require("express-validator");
const { Op } = require("sequelize");
const bcrypt = require("bcryptjs");

// create new user
exports.createUser = async (req, res) => {
  try {
    // Validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return responseHandler(
        req,
        res,
        400,
        false,
        "Validation errors",
        {
          errors: errors.array(),
        },
        ""
      );
    }

    // Extract user data from request body
    const { username, first_name, last_name, password, role_id } = req.body;
    // Check if the username already exists
    const existingUser = await db.User.findOne({
      where: {
        username: {
          [Op.eq]: username,
        },
      },
    });

    if (existingUser) {
      return responseHandler(
        req,
        res,
        400,
        false,
        "User with this username already exists",
        {},
        ""
      );
    }
    const newUser = await db.User.create({
      first_name,
      last_name,
      password,
      role_id,
      username,
    });
    // Respond with success
    return responseHandler(
      req,
      res,
      200,
      true,
      "",
      newUser,
      "User created successfully"
    );
  } catch (error) {
    responseHandler(req, res, 500, false, "Server error", { error }, "");
  }
};

// get users list
exports.usersList = async (req, res) => {
  try {
    const keyword = req.query.keyword
      ? req.query.keyword.toString().trim()
      : null;
    const limit = req.query.limit ? +req.query.limit : 10;
    const page = req.query.page ? +req.query.page : 1;
    const offset = page > 1 ? (page - 1) * limit : 0;
    const whereClause = {
      ...(keyword && {
        username: { [Op.like]: `%${keyword}%` },
      }),
    };

    let usersList = await db.User.findAll({
      ...(Object.keys(whereClause).length > 0
        ? { where: { ...whereClause } }
        : {}),
      offset,
      limit,
      order: [["created_at", "DESC"]],
      attributes: [
        "id",
        "first_name",
        "last_name",
        "username",
        "is_blocked",
        "created_at",
        "password",
      ],
      include: [
        {
          model: db.Role,
          as: "role_data",
          attributes: ["id", "role", "description"],
        },
      ],
    });
    totalCount = await db.User.count({
      ...(Object.keys(whereClause).length > 0
        ? { where: { ...whereClause } }
        : {}),
    });
    const totalPage = parseInt(totalCount / limit) + 1;
    responseHandler(
      req,
      res,
      200,
      true,
      "",
      { usersList, page, limit, totalCount, totalPage },
      "Users list fecthed successfully"
    );
  } catch (error) {
    responseHandler(req, res, 500, false, "Server error", { error }, "");
  }
};

// get all users list
exports.allUsersList = async (req, res) => {
  try {
    let usersList = await db.User.findAll({
      order: [["username", "ASC"]],
      attributes: [
        "id",
        "first_name",
        "last_name",
        "username",
        "is_blocked",
        "created_at",
        "password",
      ],
      include: [
        {
          model: db.Role,
          as: "role_data",
          attributes: ["id", "role", "description"],
        },
      ],
    });
    responseHandler(
      req,
      res,
      200,
      true,
      "",
      { usersList },
      "Users list fecthed successfully"
    );
  } catch (error) {
    responseHandler(req, res, 500, false, "Server error", { error }, "");
  }
};

// update user
exports.updateUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return responseHandler(
        req,
        res,
        400,
        false,
        "Validation errors",
        {
          errors: errors.array(),
        },
        ""
      );
    }
    const { user_id } = req.params;
    const { username, first_name, last_name, password, role_id } = req.body;
    // check if user exists

    // Check if LTS exists
    let lts = await db.User.findOne({
      where: {
        id: user_id,
      },
    });
    if (!lts) {
      return responseHandler(
        req,
        res,
        400,
        false,
        "User does not exist with this id",
        {}
      );
    }
    // check if user exist with the username
    const existingUsename = await db.User.findOne({
      where: {
        username: username,
        id: { [Op.ne]: user_id },
      },
    });
    if (existingUsename) {
      return responseHandler(
        req,
        res,
        400,
        false,
        "User with this username already exists",
        {},
        ""
      );
    }
    // const salt = await bcrypt.genSalt(10);
    // const hashedPassword = await bcrypt.hash(password, salt);
    let updatedUser = await db.User.update(
      {
        first_name,
        last_name,
        // password: hashedPassword,
        role_id,
        username,
      },
      {
        where: {
          id: user_id,
        },
      }
    );
    return responseHandler(
      req,
      res,
      200,
      true,
      "",
      null,
      "User details updated successfully."
    );
  } catch (error) {
    responseHandler(req, res, 500, false, "Server error", { error }, "");
  }
};

// delete user
exports.deleteUser = async (req, res) => {
  try {
    const { user_id } = req.params;
    // Check if LTS exists
    let user = await db.User.findOne({
      where: {
        id: user_id,
      },
    });
    if (!user) {
      return responseHandler(
        req,
        res,
        400,
        false,
        "User does not exist with this id",
        {}
      );
    }
    await db.User.destroy({
      where: {
        id: user_id,
      },
    });
    return responseHandler(
      req,
      res,
      200,
      true,
      "",
      null,
      "User deleted successfully."
    );
  } catch (error) {
    responseHandler(req, res, 500, false, "Server error", { error }, "");
  }
};

// block/ unblock user
exports.blockUnblockUser = async (req, res) => {
  try {
    const { user_id } = req.params;
    let user = await db.User.findOne({
      where: {
        id: user_id,
      },
    });
    if (!user) {
      return responseHandler(
        req,
        res,
        400,
        false,
        "User does not exist with this id",
        {}
      );
    }
    // Toggle the is_blocked value
    user.is_blocked = !user.is_blocked;

    // Save the updated user object to the database
    await user.save();
    return responseHandler(
      req,
      res,
      200,
      true,
      "",
      null,
      `User ${user.is_blocked ? "Blocked " : "Unblocked"} successfully.`
    );
  } catch (error) {
    responseHandler(req, res, 500, false, "Server error", { error }, "");
  }
};
