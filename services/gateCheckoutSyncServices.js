const db = require("../models");

exports.storeGateCheckoutData = async (bulkDriverData) => {
  const transaction = await db.sequelize.transaction();

  try {
    for (const driverData of bulkDriverData) {
      // 1. Add data to the driver_vehicle_details table
      await db.DriverVehicleDetail.update(
        {
          end: driverData.end,
          end_by: driverData.end_by,
        },
        {
          where: { id: driverData.driver_id },
          transaction,
        }
      );

      for (const lts of driverData.ltsData) {
        // 2. Delete existing SKTs, their associated varieties, and SKT_varieties data
        await deleteExistingData(lts.lts_id, transaction);

        // 3. Create new SKTs and their associated varieties
        for (const skt of lts.skts) {
          const newSkt = await db.SktDetails.create(
            {
              name: skt.skt_name,
              lts_issue_voucher_detail_id: lts.lts_id,
            },
            { transaction }
          );

          for (const variety of skt.varieties) {
            const newVariety = await db.VarietyDetail.create(
              {
                amk_number: variety.amk_number || null,
                nomenclature: variety.nomenclature || null,
                ipq: variety.ipq || null,
                package_weight: variety.package_weight || null,
                qty: variety.qty || null,
                number_of_package: variety.number_of_package || null,
                location_33_fad: variety.location_33_fad || null,
                fad_loading_point_lp_number:
                  variety.fad_loading_point_lp_number || null,
              },
              { transaction }
            );

            const newSKTVariety = await db.SktVarieties.create(
              {
                skt_id: newSkt.id,
                variety_id: newVariety.id,
              },
              { transaction }
            );

            // Conditionally insert loaded_by and loaded_time based on is_loaded
            const varietyLoadStatusData = {
              driver_vehicle_id: driverData.driver_id,
              skt_variety_id: newSKTVariety.id,

              is_loaded: variety.is_loaded,
            };

            if (variety.is_loaded) {
              // Prepare lot_number and qty as comma-separated strings
              const lotNumberString = variety.lot_number.join(",");
              const qtyString = variety.lot_qty.join(",");
              (varietyLoadStatusData.lot_number = lotNumberString),
                (varietyLoadStatusData.qty = qtyString),
                (varietyLoadStatusData.loaded_by = variety.loaded_by);
              varietyLoadStatusData.loaded_time = variety.loaded_time;
            }

            await db.VarietyLoadStatusDetail.create(varietyLoadStatusData, {
              transaction,
            });
          }
        }

        // Check and update is_loaded in AssignedLtsDetails
        await updateAssignedLtsDetails(
          driverData.driver_id,
          lts.lts_id,
          lts.skts
        );
      }
    }

    // Commit the transaction if everything succeeded
    await transaction.commit();
  } catch (error) {
    // Rollback the transaction if an error occurs
    await transaction.rollback();
    throw error;
  }
};

async function deleteExistingData(ltsId, transaction) {
  try {
    // Find SKT IDs associated with the given LTS
    const sktIds = await db.SktDetails.findAll({
      attributes: ["id"],
      where: {
        lts_issue_voucher_detail_id: ltsId,
      },
      transaction,
    });

    const varietiesIds = await db.SktVarieties.findAll({
      attributes: ["variety_id"],
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
    });

    // delete all varities
    await db.VarietyDetail.destroy({
      where: {
        id: {
          [db.Sequelize.Op.in]: varietiesIds.map((skt) => skt.variety_id),
        },
      },
      transaction,
    });

    // Delete SKTs associated with the given LTS
    await db.SktDetails.destroy({
      where: {
        lts_issue_voucher_detail_id: ltsId,
      },
      transaction,
    });
  } catch (error) {
    throw error;
  }
}

async function updateAssignedLtsDetails(driverId, ltsId, skts) {
  const allVarietiesLoaded = skts.every((skt) =>
    skt.varieties.every((variety) => variety.is_loaded)
  );
  // Update AssignedLtsDetails based on the condition
  await db.AssignedLtsDetail.update(
    { is_loaded: allVarietiesLoaded ,
    lts_issue_voucher_detail_id: ltsId},

    {
      where: {
        driver_vehicle_detail_id: driverId,
      },
    }
  );
}
