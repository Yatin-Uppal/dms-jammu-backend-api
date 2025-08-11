const loggerMiddleware = require("../middleware/logger");

module.exports = async (req, res, status, success, error, data, message) => {
  try {
    await loggerMiddleware(req, res, status);
    return res.status(status).json({
      success: success,
      error: error,
      data: data,
      message: message,
    });
  } catch (loggerError) {
    console.error("Error in responseHandler:", loggerError);
    // Handle or log the error further if needed
    return res.status(status).json({
      success: false,
      error: "Error in logging",
      data: null,
      message: "",
    });
  }
};
