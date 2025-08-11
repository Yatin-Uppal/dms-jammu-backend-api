const db = require("../models");
const responseHandler = require("../helpers/responseHandler");

exports.getRoleList = async (req, res) => {
    try {
        const rolesList = await db.Role.findAll()
        return responseHandler(req,res, 200, true, "", rolesList, "Roles fetched successfully");

    } catch (error) {
        responseHandler(req,res, 500, false, "Server error", { error }, "");
    }
}