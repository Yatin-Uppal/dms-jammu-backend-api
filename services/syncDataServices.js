const db = require("../models");

async function storeBulkDriverData(bulkDriverData, transaction) {
  for (const driverData of bulkDriverData) {
    // 1. Add data to the driver_vehicle_details table
    await db.DriverVehicleDetail.update(
      {
        begin: driverData.begin_time,
        end: driverData.end_time,
        begin_by: driverData.begin_by,
        end_by: driverData.end_by,
      },
      {
        where: { id: driverData.driver_id },
        transaction,
      }
    );
    for (const ltsVariety of driverData.lts_variety_data) {
      // 2. Fetch lts_issue_voucher_id from the lts_issue_voucher_variety table
      const ltsIssueVoucherVariety = await db.LTSVariety.findOne({
        attributes: ["lts_issue_voucher_id"],
        where: { id: ltsVariety.lts_variety_id },
        transaction,
      });

      // 3. Check if an entry already exists in AssignedLtsDetail for this driver and LTS issue
      const existingAssignedLts = await db.AssignedLtsDetail.findOne({
        where: {
          driver_vehicle_detail_id: driverData.driver_id,
          lts_issue_voucher_detail_id: ltsIssueVoucherVariety.lts_issue_voucher_id,
        },
        transaction,
      });

      if (!existingAssignedLts) {
        // 4. Create an entry in the AssignedLtsDetail table only if it doesn't already exist
        await db.AssignedLtsDetail.create(
          {
            driver_vehicle_detail_id: driverData.driver_id,
            lts_issue_voucher_detail_id: ltsIssueVoucherVariety.lts_issue_voucher_id,
            assigned_by: driverData.assigned_by,
            created_at: driverData.assigned_time,
          },
          { transaction }
        );
      }
      // 4. Create an entry in the VarietyLoadStatusDetail table
      await db.VarietyLoadStatusDetail.create(
        {
          driver_vehicle_detail_id: driverData.driver_id,
          lts_issue_voucher_variety_id: ltsVariety.lts_variety_id,
          lot_number: ltsVariety.lot_number,
          load_time: ltsVariety.loaded_time,
          load_by: ltsVariety.loaded_by,
        },
        { transaction }
      );

      // Check if all varieties for this lts_issue_voucher_id are loaded
      const allVarietiesLoaded = await areAllVarietiesLoaded(
        ltsIssueVoucherVariety.lts_issue_voucher_id,
        driverData.driver_id,
        transaction
      );

      // If all varieties are loaded, update the is_loaded field to true
      if (allVarietiesLoaded) {
        await db.AssignedLtsDetail.update(
          { is_loaded: true },
          {
            where: {
              lts_issue_voucher_detail_id:
                ltsIssueVoucherVariety.lts_issue_voucher_id,
              driver_vehicle_detail_id: driverData.driver_id,
            },
            transaction,
          }
        );
      }
    }
  }
}

// Function to check if all varieties for a given lts_issue_voucher_id are loaded
async function areAllVarietiesLoaded(ltsIssueVoucherId, driverId, transaction) {
  const totalVarieties = await db.LTSVariety.count({
    where: { lts_issue_voucher_id: ltsIssueVoucherId },
    transaction,
  });

  const loadedVarieties = await db.VarietyLoadStatusDetail.count({
    where: {
      driver_vehicle_detail_id: driverId,
      lts_issue_voucher_variety_id: {
        [db.Sequelize.Op.in]: db.Sequelize.literal(
          `(SELECT id FROM lts_issue_voucher_variety WHERE lts_issue_voucher_id = ${ltsIssueVoucherId})`
        ),
      },
    },
    transaction,
  });

  return totalVarieties === loadedVarieties;
}

module.exports = {
  storeBulkDriverData,
};
