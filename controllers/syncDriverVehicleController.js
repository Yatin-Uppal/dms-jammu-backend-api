const db = require("../models");
const { v4: uuidv4 } = require("uuid");
const responseHandler = require("../helpers/responseHandler");
const { validationResult } = require("express-validator");
const {
  handleDriverVehicleDetailsSave,
} = require("../services/driverVehicleServices");
const { fetchLatestRecordID } = require("../services/fetchRecordID");
const { Op } = require("sequelize");
const {
  getDriverListNotLoadedData,
  getLtsDataForDriverNotLoaded,
  storeBulkDriverData,
} = require("../services/syncDriverDataServices");

exports.getDriverListNotLoaded = async (req, res) => {
  try {
    // Call the getDriverListNotLoadedData function to get driver data
    const driverList = await getDriverListNotLoadedData();

    // Create an array to store LTS data for each driver
    const ltsDataPromises = driverList.map(async (driver) => {
      // Retrieve LTS IDs assigned to this driver
      const assignedLTS = await db.AssignedLtsDetail.findAll({
        where: {
          driver_vehicle_detail_id: driver.id,
          [db.Sequelize.Op.or]: [
            { is_deleted: { [db.Sequelize.Op.is]: null } }, // Exclude null values
            { is_deleted: { [db.Sequelize.Op.is]: false } }, // Exclude false values
          ],
          [db.Sequelize.Op.or]: [
            { is_loaded: { [db.Sequelize.Op.is]: null } }, // Exclude null values
            { is_loaded: { [db.Sequelize.Op.is]: false } }, // Exclude false values
          ],
        },
        attributes: ["lts_issue_voucher_detail_id"],
      });

      const assignedLtsIds = assignedLTS.map(
        (assignment) => assignment.lts_issue_voucher_detail_id
      );

      if (assignedLtsIds.length > 0) {
        const ltsDataPromises = assignedLtsIds.map(async (ltsId) => {
          return await getLtsDataForDriverNotLoaded(ltsId);
        });

        // Wait for all LTS data promises to resolve
        const ltsData = await Promise.all(ltsDataPromises);

        return {
          ...driver.toJSON(),
          ltsData,
        //   isLtsAssigned: true, // LTS is assigned to this driver
        };
      } else {
        return null; // Skip this driver, as LTS is not assigned to them
      }
    });

    // Filter out null values (drivers without LTS assignments)
    const driversWithLtsData = (await Promise.all(ltsDataPromises)).filter(driver => driver !== null);

    // Create the response structure
    const response = {
      driverList: driversWithLtsData,
    };

    responseHandler(req,res, 200, true, "", response, "Driver list fetched successfully");
  } catch (error) {
    responseHandler(req,res, 500, false, "Server error", { error }, "");
  }
};

// sync driver data
exports.bulkDriverData = async(req, res) => {
 
  let transaction;
    try {
      // Start a database transaction
      // transaction = await db.sequelize.transaction();
  
      const bulkDriverData = req.body;
      await storeBulkDriverData(bulkDriverData, transaction);
  
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
      // if (transaction) {
      //   // Roll back the transaction if there's an error
      //   await transaction.rollback();
      // }'
      responseHandler(req,
          res,
          500,
          false,
          error.message,
         "Internal server error",
        );
     
    }
  }

