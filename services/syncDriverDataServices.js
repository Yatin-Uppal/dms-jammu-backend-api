const db = require("../models");
const { getSktData, getSktDataWithVarieties } = require("./ltsServices");

// Create a function to get LTS data for a specific driver
exports.getLtsDataForDriverNotLoaded = async (lts_id) => {
  try {
    const lts = await db.LtsDetail.findOne({
      where: {
        id: lts_id,
      },
      include: [
        {
          model: db.formations,
          as: "formationData",
          attributes: ["id", "formation_name"],
        },
      ],
    });

    if (!lts) {
      return responseHandler(req,
        res,
        400,
        false,
        " LTS does not exist with this id",
        {}
      );
    }
    const sktData = await getSktData(lts.id);
    // Initialize an array to store the transformed skt data
    let sktDataWithVarieties = await getSktDataWithVarieties(sktData);

    // Transform the data into the desired format
    const ltsData = {
      ltsId: lts.id,
      ltsNo: lts.name,
      type: lts.type,
      lts_date_and_time: lts.lts_date_and_time,
      formation_name: lts?.formationData?.formation_name || "",
      fmn_id: lts?.formationData?.id || lts?.fmn_id || null,
      skts: sktDataWithVarieties,
    };

    return ltsData.skts.length > 0 ? ltsData : null;
  } catch (error) {
    throw error;
  }
};

// Create a function to get driver data with pagination
exports.getDriverListNotLoadedData = async () => {
  try {
    const driverList = await db.DriverVehicleDetail.findAll({
      where: {
        begin: null,
        // vehicle_number_ba_number: {
        //   [db.Sequelize.Op.not]: [null, ''], // Exclude null and empty string values
        // },
        vehicle_number_ba_number: {
          [db.Sequelize.Op.not]: [""], // Exclude the current record being updated
        }
      },
      attributes: [
        "id",
        "record_id",
        "vehicle_type_id",
        "vehicle_number_ba_number",
        "vehicle_capacity",
        "driver_name",
        "driver_id_card_number",
        "escort_number_rank_name",
        "id_card_number_adhar_number_dc_number",
        "unit",
        "series",
        "fmn_id",
        "begin",
        "begin_by",
        "resource",
        "title",
      ],
      include: [
        // Include necessary associations to fetch related data
        {
          model: db.User,
          as: "beginBy",
          attributes: ["id", "username", "first_name", "last_name"],
          include: [
            {
              model: db.Role,
              as: "role_data",
              attributes: ["id", "role"],
            },
          ],
        },
        {
          model: db.VehicleType,
          as: "vehicleType",
          attributes: ["id", "vehicle_type"],
        },
        {
          model: db.formations,
          as: "formation_details",
          attributes: ["id", "formation_name"],
        },
      ],
    });

    return driverList;
  } catch (error) {
    throw error;
  }
};



exports.storeBulkDriverData = async (bulkDriverData) => {
  const transaction = await db.sequelize.transaction();
  try {
    for (const driverData of bulkDriverData) {
      // Delete records from assigned_lts_issue_voucher_details based on lts_id

      await db.AssignedLtsDetail.destroy({
        where: {
          lts_issue_voucher_detail_id: driverData.ltsData[0].lts_id,
        },
        transaction,
      });
      // Check if a record exists based on driver_id
      const existingRecord = await db.AssignedLtsDetail.findOne({
        where: {
          driver_vehicle_detail_id: driverData.driver_id,
        },
        transaction,
      });
      if (existingRecord) {
      

        // Update the existing record with the new lts_id
        await db.AssignedLtsDetail.update(
          {
            lts_issue_voucher_detail_id: driverData.ltsData[0].lts_id,
          },
          {
            where: {
              driver_vehicle_detail_id: driverData.driver_id,
            },
            transaction,
          }
        );
      } else {
        // Insert a new record with driver_id and lts_id
        await db.AssignedLtsDetail.create(
          {
            driver_vehicle_detail_id: driverData.driver_id,
            lts_issue_voucher_detail_id: driverData.ltsData[0].lts_id,
          },
          { transaction }
        );
      }

      const existingDriver = await db.DriverVehicleDetail.findOne({
        where: { id: driverData.driver_id },
        transaction,
      });

      if (existingDriver && existingDriver.end && existingDriver.end_by) {
        // Driver already has an end date and end_by, update only begin and begin_by
        await db.DriverVehicleDetail.update(
          {
            begin: driverData.in_time,
            begin_by: driverData.begin_by,
          },
          {
            where: { id: driverData.driver_id },
            transaction,
          }
        );
      } else {
        // Driver does not have an end date and end_by, perform complete functionality
        // 1. Add data to the driver_vehicle_details table
        await db.DriverVehicleDetail.update(
          {
            begin: driverData.in_time,
            begin_by: driverData.begin_by,
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
              let amn_shelf_life = variety.amn_shelf_life;
              let amkQuantityRecord = null;
              if (!amn_shelf_life) {
                // Find matching AMK Quantity for amn_shelf_life
                amkQuantityRecord = await db.ManageAmkQuantity.findOne({
                  where: {
                    amk_number: variety.amk_number,
                    location: skt.skt_name,
                    [db.Sequelize.Op.or]: [
                      { is_deleted: { [db.Sequelize.Op.is]: null } },
                      { is_deleted: { [db.Sequelize.Op.is]: false } },
                    ],
                  },
                  transaction
                });
                amn_shelf_life = amkQuantityRecord ? amkQuantityRecord.amn_shelf_life : null;
              }

              const newVariety = await db.VarietyDetail.create(
                {
                  amk_number: variety.amk_number || null,
                  nomenclature: variety.nomenclature || null,
                  amn_shelf_life: amn_shelf_life || null,
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

              const newSktVariety = await db.SktVarieties.create(
                {
                  skt_id: newSkt.id,
                  variety_id: newVariety.id,
                },
                { transaction }
              );
              
              let lotDetails = [];
              for (const lot of variety.lot_numbers) {
                let condition = lot.condition;
                let pkg_type = lot.pkg_type;
                if (!condition || !pkg_type) {
                  if (!amkQuantityRecord) {
                    amkQuantityRecord = await db.ManageAmkQuantity.findOne({
                      where: {
                        amk_number: variety.amk_number,
                        location: skt.skt_name,
                        [db.Sequelize.Op.or]: [
                          { is_deleted: { [db.Sequelize.Op.is]: null } },
                          { is_deleted: { [db.Sequelize.Op.is]: false } },
                        ],
                      },
                      transaction
                    });
                  }
                  if (amkQuantityRecord) {
                    const lotDetailRecord = await db.AmkLotDetails.findOne({
                      where: {
                        amk_id: amkQuantityRecord.id,
                        lot_number: lot.lot_number,
                      },
                      transaction
                    });
                    if (lotDetailRecord) {
                      if (!condition) condition = lotDetailRecord.condition;
                      if (!pkg_type) pkg_type = lotDetailRecord.pkg_type;
                    }
                  }
                }

                lotDetails.push({
                  driver_vehicle_id: driverData.driver_id,
                  skt_variety_id: newSktVariety.id,
                  lot_number: lot.lot_number,
                  lot_quantity: lot.lot_quantity,
                  condition: condition || null,
                  pkg_type: pkg_type || null,
                  load_status: "Pending"
                });
              }
              lotDetails.length > 0 && await db.VarietyLoadDetails.bulkCreate(lotDetails, { transaction });
            }
          }
        }
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
      attributes: ["id", "variety_id"],
      where: {
        skt_id: {
          [db.Sequelize.Op.in]: sktIds.map((skt) => skt.id),
        },
      },
      transaction,
    });

    await db.VarietyLoadDetails.destroy({
      where: {
        skt_variety_id: {
          [db.Sequelize.Op.in]: varietiesIds.map((skt) => skt.id),
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
