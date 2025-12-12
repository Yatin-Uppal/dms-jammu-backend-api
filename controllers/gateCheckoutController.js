const db = require("../models");
const responseHandler = require("../helpers/responseHandler");
const path = require("path"); // Add this import for file extension check
// const fs = require("fs");
const {
    storeGateCheckoutData,
} = require("../services/gateCheckoutSyncServices");

// sync driver data
exports.handleBulkGateCheckoutData = async(req, res) => {
 
  let transaction;
    try {
      // Start a database transaction
      // transaction = await db.sequelize.transaction();
  
      const bulkDriverData = req.body;
    //  fs.appendFileSync(`logs.txt`,JSON.stringify(bulkDriverData));
      if (!bulkDriverData || bulkDriverData.length === 0) {
        // Handle the case where there is no data in bulkDriverData
        return responseHandler(req,
          res,
          400,
          false,
          "No data provided in the request.",
          "Bad Request"
        );
      }
      await storeGateCheckoutData(bulkDriverData, transaction);
  
      // Commit the transaction if everything is successful
      // await transaction.commit();
      responseHandler(req,
          res,
          200,
          true,
          "",
         "",
          "Data Synced Successfully ."
        );
     
    } catch (error) {
      console.log('error: ', error);
      // if (transaction) {
      //   // Roll back the transaction if there's an error
      //   await transaction.rollback();
      // }
      responseHandler(req,
          res,
          500,
          false,
          error.message,
         "Internal server error",
        );
     
    }
  }

