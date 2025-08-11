// controllers/logController.js
const responseHandler = require("../helpers/responseHandler");
const db = require("../models");

const getLogs = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      module_name,
      startDate,
      endDate,
      user_id,
    } = req.query;
    const whereClause = {};
    if (module_name) {
      whereClause.module_name = module_name;
    }
    if (startDate && endDate) {
      // Validate date strings
      const isValidDate = (dateString) => !isNaN(Date.parse(dateString));
      if (isValidDate(startDate) && isValidDate(endDate)) {
        whereClause.created_at = {
          [db.Sequelize.Op.between]: [
            new Date(`${startDate} 00:00:00`),
            new Date(`${endDate} 23:59:59`),
          ],
        };
      } else {
        throw new Error("Invalid date format");
      }
    }
    if (user_id) {
      whereClause.user_id = user_id;
    }

    const logs = await db.Log.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: (page - 1) * limit,
      order: [["created_at", "DESC"]],
      attributes: [
        "id",
        "url",
        "httpMethod",
        "status",
        "user_id",
        "created_at",
        "module_name",
        "parameters",
        "action_description",
        "operation_result"
      ],
      include: [
        {
          model: db.User,
          as: "userId",
          attributes: ["id", "role_id", "first_name", "last_name", "username"],
          include: [
            { model: db.Role, as: "role_data", attributes: ["id", "role"] },
          ],
        },
      ],
    });

    responseHandler(req,
      res,
      200,
      true,
      "",
      {
        total: logs.count,
        logs: logs.rows,
        page: parseInt(page),
        totalPages: Math.ceil(logs.count / limit),
      },
      "Activity Logs fetched Successful."
    );
  } catch (error) {
    responseHandler(req,res, 500, false, "Server error", error, "");
    next(error);
  }
};

module.exports = { getLogs };
