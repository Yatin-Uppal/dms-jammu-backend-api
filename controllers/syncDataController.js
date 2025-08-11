const { sequelize } = require("../models");
const syncDataServices = require("../services/syncDataServices");
const responseHandler = require("../helpers/responseHandler");
// Create a function to handle the bulk driver data submission
async function bulkDriverData(req, res) {
  let transaction;
  try {
    // Start a database transaction
    transaction = await sequelize.transaction();

    const bulkDriverData = req.body;
    await syncDataServices.storeBulkDriverData(bulkDriverData, transaction);

    // Commit the transaction if everything is successful
    await transaction.commit();
    responseHandler(req,
        res,
        200,
        true,
        "",
       "",
        "Data Synced Successfully ."
      );
   
  } catch (error) {
    if (transaction) {
      // Roll back the transaction if there's an error
      await transaction.rollback();
    }
    responseHandler(req,
        res,
        500,
        false,
        error.message,
       "Internal server error",
      );
   
  }
}

module.exports = {
  bulkDriverData,
};
