const db = require("../models");

// take out the latest record id
const getLatestDriverRecordId = async (record_id_counter, model) => {
  const latestRecord = await db[model].findOne({
    attributes: [
      [db.sequelize.fn("MAX", db.sequelize.col("record_id")), "max_record_id"],
    ],
  });

  // Calculate the next record_id based on the latestRecord
  let record_id;
  if (latestRecord.dataValues.max_record_id) {
    const lastRecordNumber = parseInt(
      latestRecord.dataValues.max_record_id.split("-")[1]
    );
    record_id = `ACTM-${(lastRecordNumber + record_id_counter)
      .toString()
      .padStart(6, "0")}`;
  } else {
    record_id = `ACTM-${record_id_counter.toString().padStart(6, "0")}`;
  }
  return record_id;
};

// get the vehicle type id
const getVehicleTypeID = async (vehicle_type) => {
  // Fetch the corresponding vehicle_type_id from the vehicleType table

  const vehicleTypeInfo = await db.VehicleType.findOne({
    where: { vehicle_type: vehicle_type }, // Adjust the field name as needed
    attributes: ["id"], // Fetch only the id
  });

  if (vehicleTypeInfo) {
    // If the formation exists, return its fmn_id
    return vehicleTypeInfo.id;
  } else {
    // If the formation doesn't exist, create it and return its fmn_id
    const newVehicleType = await db.VehicleType.create({
      vehicle_type: vehicle_type,
    });

    if (newVehicleType) {
      return newVehicleType.id;
    } else {
      throw new Error("Formation creation failed.");
    }
  }
};

// get the formation value
const getFormationID = async (fmn_value) => {
  try {
    // Check if the formation already exists
    const existingFormation = await db.formations.findOne({
      where: { formation_name: fmn_value },
    });

    if (existingFormation) {
      // If the formation exists, return its fmn_id
      return existingFormation.id;
    } else {
      // If the formation doesn't exist, create it and return its fmn_id
      const newFormation = await db.formations.create({
        formation_name: fmn_value,
      });

      if (newFormation) {
        return newFormation.id;
      } else {
        throw new Error("Formation creation failed.");
      }
    }
  } catch (error) {
    // Handle errors, e.g., log them or throw a custom error
    console.error("Error in getFormationID:", error);
    throw new Error("Failed to get or create formation.");
  }
};

exports.transformData = async (jsonData) => {
  const transformedData = [];

  for (const row of jsonData) {
    const newRow = {
      vehicle_type_id: row["Type of Veh (DD Vehicle / CHT / TATRA)"]
        ? await getVehicleTypeID(row["Type of Veh (DD Vehicle / CHT / TATRA)"])
        : null,
      vehicle_number_ba_number: row["Vehicle No / BA No"] || null,
      resource: row["Resource"] || null,
      begin: row["Begin"] ? row["Begin"] : null,
      end: row["End"] ? row["End"] : null,
      title: row["Title"] || null,
      escort_number_rank_name: row["Escort No. Rank Name"] || null,
      id_card_number_adhar_number_dc_number:
        row["I-Card No/Adhar No/DL No"] ||
        row["I-Card No/Adhar No/DL No "] ||
        null,
      unit: row["Unit"] || null,
      series: row["Series"] || null,
      fmn_id: row["Fmn"] ? await getFormationID(row["Fmn"]) : null,
      created_at: row["GateIn"] ? row["GateIn"] : null,
      ltsData: [
        {
          name: row["LTS No."] || null,
          type: "load_tally_sheet_lts_number",
          lts_date_and_time: row["LTS Date and Time"]
            ? new Date(row["LTS Date and Time"])
            : new Date(),
          fmn_id: row["Fmn"] ? await getFormationID(row["Fmn"]) : null,
          skts: [],
        },
      ],
    };
    let locationCount = Object.keys(row).filter((key) =>
      key.includes("Location")
    ).length;
    for (let i = 0; i <= locationCount; i++) {
      const sktLocation = row[`${i + 1}.Location`];
      if (sktLocation) {
        const skt = {
          name: sktLocation,
          varieties: [],
        };

        let varietyCount = Object.keys(row).filter((key) =>
          key.startsWith(`${i + 1}.AMK No.`)
        ).length;

        for (let j = 1; j <= varietyCount; j++) {
          let extention = "_" + j;
          const varietyDetail = {
            amk_number: row[`${i + 1}.AMK No.` + extention] || null,
            nomenclature: row[`${i + 1}.Nomenclature` + extention] || null,
            ipq: row[`${i + 1}.IPQ` + extention] || null,
            package_weight: row[`${i + 1}.Weight` + extention] || null,
            qty_required: row[`${i + 1}.Qty Required Nos.` + extention] || null,
            qty: row[`${i + 1}.Qty Given Nos.` + extention] || null,
            number_of_package: row[`${i + 1}.Pkg Nos` + extention] || null,
            location_33_fad: row[`${i + 1}.Name of SKT` + extention] || null,
            fad_loading_point_lp_number:
              row[`${i + 1}.Loading Point` + extention] || null,
          };

          skt.varieties.push(varietyDetail);
        }

        newRow.ltsData[0].skts.push(skt);
      }
    }

    transformedData.push(newRow);
  }

  return transformedData;
};

exports.storeBulkDriverData = async (bulkDriverData, userId) => {
  const transaction = await db.sequelize.transaction();
  // Set the timezone for the Node.js application
  try {
    let record_id_counter = 1; // Initialize a counter
    for (const driverData of bulkDriverData) {
      const createdDriver = await db.DriverVehicleDetail.create(
        {
          record_id: await getLatestDriverRecordId(record_id_counter, "DriverVehicleDetail"),
          vehicle_type_id: driverData.vehicle_type_id || null,
          vehicle_number_ba_number: driverData.vehicle_number_ba_number || null,
          resource: driverData.resource || null,
          begin: driverData.begin || null,
          end: driverData.end || null,
          title: driverData.title || null,
          escort_number_rank_name: driverData.escort_number_rank_name || null,
          id_card_number_adhar_number_dc_number:
            driverData.id_card_number_adhar_number_dc_number || null,
          unit: driverData.unit || null,
          series: driverData.series || null,
          fmn_id: driverData.fmn_id || null,
          created_at: driverData.created_at || null,
          created_by: userId,
        },
        {
          transaction,
        }
      );
      // Increment the counter for the next iteration
      record_id_counter++;
      for (const lts of driverData.ltsData) {
        const storeLtsData = await db.LtsDetail.create(
          {
            name: lts.name || null,
            lts_date_and_time: lts.lts_date_and_time || null,
            type: lts.type || null,
            fmn_id: lts.fmn_id || null,
            created_at: driverData.created_at || new Date(),
            created_by: userId
          },
          {
            transaction,
          }
        );

        await db.AssignedLtsDetail.create(
          {
            driver_vehicle_detail_id: createdDriver.id,
            lts_issue_voucher_detail_id: storeLtsData.id,
            assigned_by: userId,
          },
          {
            transaction,
          }
        );

        for (const skt of lts.skts) {
          const newSkt = await db.SktDetails.create(
            {
              name: skt.name || null,
              lts_issue_voucher_detail_id: storeLtsData.id,
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
                qty_required: variety.qty_required || null,
                number_of_package: variety.number_of_package || null,
                location_33_fad: variety.location_33_fad || null,
                fad_loading_point_lp_number:
                  variety.fad_loading_point_lp_number || null,
              },
              { transaction }
            );

            const createdSktVariety = await db.SktVarieties.create(
              {
                skt_id: newSkt.id,
                variety_id: newVariety.id,
              },
              { transaction }
            );

            if (variety.lot_numbers && Array.isArray(variety.lot_numbers)) {
              for (const lot of variety.lot_numbers) {
                await db.VarietyLoadDetails.create(
                  {
                    driver_vehicle_id: createdDriver.id,
                    skt_variety_id: createdSktVariety.id,
                    lot_number: lot.lot_number,
                    lot_quantity: lot.lot_quantity,
                    load_status: "Pending", // default status
                  },
                  { transaction }
                );
              }
            }
          }
        }
      }
    }

    // Commit the transaction if everything is successful
    await transaction.commit();
  } catch (error) {
    // Rollback the transaction if an error occurs
    await transaction.rollback();
    throw error;
  }
};

exports.validatedAmkQuantities = async (data) => {
  try {
    const amkLocPairs = new Map();

    // Collect requested quantities for each AMK + Location pair
    for (const row of data) {
      for (const lts of row.ltsData) {
        for (const skt of lts.skts) {
          for (const variety of skt.varieties) {
            const key = `${skt.name}__${variety.amk_number}`;
            if (!amkLocPairs.has(key)) {
              amkLocPairs.set(key, {
                amk_number: variety.amk_number,
                location: skt.name,
                requestedQty: 0,
                varieties: [],
              });
            }
            const pair = amkLocPairs.get(key);
            pair.requestedQty += parseFloat(variety.qty || 0);
            pair.varieties.push(variety);
          }
        }
      }
    }

    // Fetch available lots for each pair
    for (const [key, pair] of amkLocPairs) {
      const amkQuantity = await db.ManageAmkQuantity.findOne({
        where: {
          amk_number: pair.amk_number,
          location: pair.location,
          [db.Sequelize.Op.or]: [
            { is_deleted: { [db.Sequelize.Op.is]: null } }, // Exclude null values
            { is_deleted: { [db.Sequelize.Op.is]: false } }, // Exclude false values
          ],
        },
        include: [
          {
            model: db.AmkLotDetails,
            as: "amkLotDetails",
            where: {
              [db.Sequelize.Op.or]: [
                { is_deleted: { [db.Sequelize.Op.is]: null } }, // Exclude null values
                { is_deleted: { [db.Sequelize.Op.is]: false } }, // Exclude false values
              ],
            },
          },
        ],
        order: [
          ["created_at", "DESC"],

          // ORDER child records
          [{ model: db.AmkLotDetails, as: "amkLotDetails" }, "manufacture_date", "ASC"]
        ]
      });

      if (!amkQuantity || parseFloat(amkQuantity.total_quantity) < pair.requestedQty) {
        return null; // Insufficient quantity
      }

      // FIFO Allocation
      let availableLots = amkQuantity.amkLotDetails.map((lot) => ({
        lot_number: lot.lot_number,
        remaining_qty: parseFloat(lot.lot_quantity),
      }));

      for (const variety of pair.varieties) {
        let qtyToAssign = parseFloat(variety.qty || 0);
        const assignedLots = [];

        for (const lot of availableLots) {
          if (qtyToAssign <= 0) break;
          if (lot.remaining_qty <= 0) continue;

          const take = Math.min(qtyToAssign, lot.remaining_qty);
          assignedLots.push({
            lot_number: lot.lot_number,
            lot_quantity: take,
          });
          lot.remaining_qty -= take;
          qtyToAssign -= take;
        }

        if (qtyToAssign > 0) {
          // This case should ideally not happen if total_quantity was pre-validated correctly
          // but good for safety.
          return null;
        }
        variety.lot_numbers = assignedLots;
      }
    }

    return data;
  } catch (error) {
    console.error("Error in validating Amk Quantities:", error);
    throw error;
  }
};
