const db = require("../models");
exports.storeBulkAMKQuantityData = async (jsonData) => {
  const transaction = await db.sequelize.transaction();
  try {
    // Step 1: Bulk update to set is_deleted to true for all existing records
    await db.ManageAmkQuantity.update(
      { is_deleted: true },
      { where: {}, transaction }
    );
    // Step 2: Map Excel column names to database field names
    const mappedData = jsonData.map((row) => {
      return {
        amk_number: row["AMK No."], // Replace with the actual Excel column name
        location_33_fad: row["Location"], // Replace with the actual Excel column name
        total_quantity: row["Total Quantity"], // Replace with the actual Excel column name
      };
    });
    // Step 3: Bulk insert the new data into the ManageAmkQuantity table
    await db.ManageAmkQuantity.bulkCreate(mappedData, { transaction });

    await transaction.commit();
  } catch (error) {
    // Rollback the transaction if an error occurs
    await transaction.rollback();
    throw error;
  }
};
