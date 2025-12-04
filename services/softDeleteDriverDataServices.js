const { Op } = require("sequelize");
const db = require("../models");

async function softDeleteDriverData(driverIds, LTSIds) {
  const transaction = await db.sequelize.transaction();

  try {
    // Soft delete records within the specified date range in AssignedLtsDetail
    await db.AssignedLtsDetail.destroy({
      where: {
        driver_vehicle_detail_id: {
          [Op.in]: driverIds.map((driver) => driver.id),
        },
      },
      transaction,
      paranoid: true, // Enable soft delete by using the paranoid option
    });

    // Call a function to delete other related data if needed (e.g., LTS data)
    // Pass the LTS IDs, driver IDs, and transaction
    await deleteExistingData(driverIds, LTSIds, transaction);

    // Soft delete records within the specified date range in DriverVehicleDetail
    await db.DriverVehicleDetail.destroy({
      where: {
        id: {
          [Op.in]: driverIds.map((driver) => driver.id),
        },
      },
      transaction,
      paranoid: true, // Enable soft delete by using the paranoid option
    });

    await transaction.commit();

    return true; // Indicates successful deletion
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

async function deleteExistingData(driverIds, LTSIds, transaction) {
  try {
    for (const ltsId of LTSIds) {
      const lts_id = ltsId.id;

      // Find SKT IDs associated with the given LTS
      const sktIds = await db.SktDetails.findAll({
        attributes: ["id"],
        where: {
          lts_issue_voucher_detail_id: lts_id,
        },
        transaction,
      });

      const varietiesIds = await db.SktVarieties.findAll({
        attributes: ["id", "variety_id"],
        where: {
          skt_id: {
            [db.Sequelize.Op.in]: sktIds.map((skt) => skt.id),
          },
        },
        transaction,
      });

      // Delete SKT_varieties associated with the found SKT IDs
      await db.SktVarieties.destroy({
        where: {
          skt_id: {
            [db.Sequelize.Op.in]: sktIds.map((skt) => skt.id),
          },
        },
        transaction,
        paranoid: true, // Enable soft delete by using the paranoid option
      });

      // Delete all varieties with the paranoid option enabled
      await db.VarietyDetail.destroy({
        where: {
          id: {
            [db.Sequelize.Op.in]: varietiesIds.map((skt) => skt.variety_id),
          },
        },
        transaction,
        paranoid: true, // Enable soft delete by using the paranoid option
      });

      await db.VarietiesLotDetails.destroy({
        where: {
          // You may need to adjust this condition based on your database schema
          skt_variety_id: {
            [db.Sequelize.Op.in]: varietiesIds.map((skt) => skt.variety_id),
          },
        },
        transaction,
      });

      // Delete SKTs associated with the given LTS with the paranoid option enabled
      await db.SktDetails.destroy({
        where: {
          lts_issue_voucher_detail_id: lts_id,
        },
        transaction,
        paranoid: true, // Enable soft delete by using the paranoid option
      });

      // Delete lts associated with the given LTS with the paranoid option enabled
      await db.LtsDetail.destroy({
        where: {
          id: lts_id,
        },
        transaction,
        paranoid: true, // Enable soft delete by using the paranoid option
      });
    }
  } catch (error) {
    throw error;
  }
}

module.exports = {
  softDeleteDriverData,
};
