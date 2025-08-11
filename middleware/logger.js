// loggerMiddleware.js
const db = require("../models");
const { getLogMessage } = require("../services/logMessageResolver");
const { getModuleName } = require("../services/moduleNameResolver");

const loggerMiddleware = async (req, res, status) => {
  try {
    let module_name = await getModuleName(req.originalUrl);
    let actionData = await getLogMessage(
      module_name,
      req.method,
      status,
      req,
      res
    );

    // Log only POST, PUT, DELETE, and PATCH requests
    if (["POST", "PUT", "DELETE", "PATCH"].includes(req.method)) {
      await db.Log.create({
        url: req.originalUrl,
        httpMethod: req.method,
        status: status,
        module_name: module_name,
        user_id: req.headers.user_id ? req.headers.user_id : null,
        parameters: req.body || req.params,
        action_description: actionData ? actionData.action_performed : null,
        operation_result: actionData ? actionData.message : null,
      });
    }
  } catch (error) {
    console.error("Error logging request:", error);
    throw error; // Rethrow the error to be caught in the calling function
  }
};

module.exports = loggerMiddleware;
