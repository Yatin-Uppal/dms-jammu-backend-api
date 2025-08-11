// controllers/assignedLtsController.js

const db = require("../models");
const responseHandler = require("../helpers/responseHandler");
const { validationResult } = require("express-validator");
const { Op } = require("sequelize");
const {
  handleExistingAssignedLTS,
  handleFilterOldLTSDeleted,
  handleUpdateLTS,
  handleCreateLTS,
  handleCheckLTSAlreadyAssigned,
} = require("../services/assignedLTSServices");
const {
  handleUpdatedAssignedLTS,
} = require("../services/updatedAssignedLTSServices");

// assigned the lts to the driver
exports.assignLtsDetails = async (req, res) => {
  // Validation
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return responseHandler(
      req,
      res,
      400,
      false,
      "Validation errors",
      {
        errors: errors.array(),
      },
      ""
    );
  }

  try {
    const { driver_vehicle_detail_id, lts_issue_voucher_detail_id, user_id } =
      req.body;

    // Check if LTS details are already assigned to this driver
    const existingAssignments = await db.AssignedLtsDetail.findAll({
      where: {
        driver_vehicle_detail_id,
     
      },
    });
    let updatePromises;
    if (existingAssignments.length > 0) {
      // LTS details are already assigned, update the existing records if needed
      updatePromises = existingAssignments.map(async (assignment) => {
        if (lts_issue_voucher_detail_id !== 0) {
          // Update assignment as needed
          await assignment.update({
            assigned_by: user_id,
            lts_issue_voucher_detail_id: lts_issue_voucher_detail_id,
            is_deleted : false
          });
        } else {
          await db.AssignedLtsDetail.destroy({
            where: {
              driver_vehicle_detail_id,
              [db.Sequelize.Op.or]: [
                { is_deleted: { [db.Sequelize.Op.is]: null } }, // Exclude null values
                { is_deleted: { [db.Sequelize.Op.is]: false } }, // Exclude false values
              ],
            },
          });
        }
      });

      await Promise.all(updatePromises);
    } else {
      // LTS details are not assigned, insert new records
      await db.AssignedLtsDetail.create({
        driver_vehicle_detail_id,
        lts_issue_voucher_detail_id: lts_issue_voucher_detail_id,
        assigned_by: user_id,
      });
    }

    responseHandler(
      req,
      res,
      200,
      true,
      "",
      "",
      lts_issue_voucher_detail_id !== 0
        ? "LTS assigned successfully!"
        : "LTS Unassigned successfully."
    );
  } catch (error) {
    responseHandler(req, res, 500, false, "Server error", { error }, "");
  }
};

exports.updateAssignedLtsDetails = async (req, res) => {
  // Validation
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return responseHandler(
      req,
      res,
      400,
      false,
      "Validation errors",
      {
        errors: errors.array(),
      },
      ""
    );
  }
  try {
    const { user_id, lts_varitiy_id, is_loaded } = req.body;
    const updatedAssignedLTSWithData = [];
    const alreadyLoadedIds = [];
    const currentTime = new Date(); // Get the current timestamp
    for (const assignedId of assigned_lts_details_id) {
      const assignedLTS = await db.AssignedLtsDetail.findOne({
        where: {
          id: assignedId,
        },
      });
      if (!assignedLTS) {
        return responseHandler(
          req,
          res,
          404,
          false,
          "Assigned LTS Not Found",
          {},
          ""
        );
      }
      if (assignedLTS) {
        if (!assignedLTS.is_loaded) {
          // If the record is not loaded, update it
          await db.AssignedLtsDetail.update(
            {
              is_loaded: true,
              loaded_by: user_id,
              loaded_time: currentTime, // Update the loaded_time field
            },
            {
              where: {
                id: assignedId,
              },
            }
          );
          updatedAssignedLTSWithData.push(assignedId);
        } else {
          // If the record is already loaded
          alreadyLoadedIds.push(assignedId);
        }
      }
    }

    let message = "";
    let fetchedData = [];
    let Lts_loaded_data = [];
    if (updatedAssignedLTSWithData.length > 0) {
      fetchedData = await fetchAssignedLtsDetails(updatedAssignedLTSWithData); // Fetch the updated data
    }
    if (alreadyLoadedIds.length > 0) {
      Lts_loaded_data = await fetchAssignedLtsDetails(alreadyLoadedIds);
    }

    if (updatedAssignedLTSWithData.length > 0 && alreadyLoadedIds.length > 0) {
      message += `New Lts Loaded and some assigned LTS records are already loaded.`;
    } else if (
      updatedAssignedLTSWithData.length > 0 &&
      alreadyLoadedIds.length === 0
    ) {
      message = "Assigned LTS details updated successfully!";
    } else {
      message += `Assigned LTS records are already loaded.`;
    }

    responseHandler(
      req,
      res,
      200,
      true,
      "",
      {
        updatedAssignedLTSWithData: fetchedData,
        alreadyLoadedLTSData: Lts_loaded_data,
      },
      message
    );
  } catch (error) {
    responseHandler(req, res, 500, false, "Server error", { error }, "");
  }
};

// Function to fetch assigned LTS details
async function fetchAssignedLtsDetails(ids) {
  return db.AssignedLtsDetail.findAll({
    where: {
      id: ids,
    },
    attributes: [
      "id",
      "driver_vehicle_detail_id",
      "lts_detail_id",
      "is_loaded",
      "loaded_time",
    ],
    include: [
      {
        model: db.User,
        as: "loadedByUser",
        attributes: ["id", "username", "first_name", "last_name"],
        include: [
          { model: db.Role, as: "role_data", attributes: ["id", "role"] },
        ],
      },
      {
        model: db.DriverVehicleDetail,
        as: "driverVehicleDetail",
        attributes: [
          "id",
          "record_id",
          "vehicle_number_ba_number",
          "driver_name",
          "driver_id_card_number",
          "escort_number_rank_name",
          "id_card_number_adhar_number_dc_number",
          "unit",
          "series",
          "fmn",
          "created_by",
        ],
        include: [
          {
            model: db.VehicleType,
            as: "vehicleType",
            attributes: ["id", "vehicle_type", "description"],
          },
          {
            model: db.VehicleCapacity,
            as: "VehicleCapacity",
            attributes: ["id", "capacity", "description"],
          },
          {
            model: db.User,
            as: "createdByUser",
            attributes: ["id", "username", "first_name", "last_name"],
            include: [
              { model: db.Role, as: "role_data", attributes: ["id", "role"] },
            ],
          },
        ],
      },
      {
        model: db.LtsDetail,
        as: "ltsDetail",
        attributes: ["id", "load_telly_sheet_lts_number"],
      },
    ],
  });
}

// delete the assigned lts records

exports.deleteAssignedLtsDetail = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the record by ID
    const assignedLTS = await db.AssignedLtsDetail.findOne({
      where: {
        id,
      },
    });

    if (!assignedLTS) {
      return responseHandler(
        req,
        res,
        404,
        false,
        "Assigned LTS Detail Not Found",
        {},
        ""
      );
    }

    if (assignedLTS.is_deleted) {
      return responseHandler(
        req,
        res,
        400,
        false,
        "Assigned LTS Detail is already deleted",
        {},
        ""
      );
    }

    // Update the is_delete value to true
    await db.AssignedLtsDetail.update(
      {
        is_deleted: true,
      },
      {
        where: {
          id,
        },
      }
    );

    responseHandler(
      req,
      res,
      200,
      true,
      "",
      {},
      "Assigned LTS detail deleted successfully!"
    );
  } catch (error) {
    responseHandler(req, res, 500, false, "Server error", { error }, "");
  }
};

// update multiple lts varities
exports.updateMultipleLTSVarities = async (req, res) => {
  // Validation
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return responseHandler(
      req,
      res,
      400,
      false,
      "Validation errors",
      {
        errors: errors.array(),
      },
      ""
    );
  }
  const { lts_varitiy_data } = req.body;
  let updatedResponseData;
  try {
    // Loop through the array and update records
    for (const updateData of lts_varitiy_data) {
      const {
        user_id,
        is_loaded,
        lts_varities_id,
        driver_vehicle_id,
        loaded_time,
        lot,
      } = updateData;

      // Fetch the LTS ID associated with the driver_vehicle_detail_id
      const driverVehicleDetails = await db.AssignedLtsDetail.findAll({
        attributes: ["lts_issue_voucher_detail_id"],
        where: {
          driver_vehicle_detail_id: driver_vehicle_id,
        },
      });
      // Check if any LTS detail matches the provided lts_varities_id
      let matchingLtsId = null;
      for (const driverVehicleDetail of driverVehicleDetails) {
        const ltsDetailId = driverVehicleDetail.lts_issue_voucher_detail_id;
        // Fetch the LTS ID associated with the current lts_varities_id
        const ltsVariety = await db.LTSVariety.findOne({
          attributes: ["lts_issue_voucher_id"],
          where: {
            id: lts_varities_id,
          },
        });

        if (ltsVariety && ltsVariety.lts_issue_voucher_id === ltsDetailId) {
          matchingLtsId = ltsDetailId;
          break;
        }
      }
      if (!matchingLtsId) {
        // Handle the case where no matching LTS detail is found
        return responseHandler(
          req,
          res,
          400,
          false,
          "This LTS is not assigned to this driver",
          null,
          ""
        );
      }
      // Update the records in the lts_varities table
      await db.LTSVariety.update(
        {
          is_loaded,
          loaded_time,
          loaded_by: user_id, // Assuming user_id corresponds to loaded_by in the table
        },
        {
          where: {
            id: {
              [Op.in]: lts_varities_id,
            },
          },
        }
      );

      // update assigned lts
      const lts_varities_ids = updateData.lts_varities_id;
      for (const varityId of lts_varities_ids) {
        // Extract lts_id from the current lts_varity_id entry
        const currentLTSVariety = await db.LTSVariety.findOne({
          where: {
            id: varityId,
          },
          attributes: [
            "id",
            "lts_issue_voucher_id",
            "variety_id",
            "is_loaded",
            "loaded_time",
            "loaded_by",
          ],
        });
        if (currentLTSVariety) {
          const variety_id = currentLTSVariety.variety_id;
          // Update the variety_details table with the provided lot value
          await db.VarietyDetail.update(
            {
              lot, // Update with the provided lot value
            },
            {
              where: {
                id: variety_id,
              },
            }
          );

          const lts_id = currentLTSVariety.lts_issue_voucher_id;
          // Count the total varieties for the given lts_id
          const totalVarietiesCount = await db.LTSVariety.count({
            where: {
              lts_issue_voucher_id: lts_id,
            },
          });

          // Count the loaded varieties for the given lts_id
          const loadedVarietiesCount = await db.LTSVariety.count({
            where: {
              lts_issue_voucher_id: lts_id,
              is_loaded: true,
            },
          });

          if (totalVarietiesCount === loadedVarietiesCount) {
            // Update the assigned_lts_table
            await db.AssignedLtsDetail.update(
              {
                is_loaded: true,
              },
              {
                where: {
                  lts_issue_voucher_detail_id: lts_id,
                  driver_vehicle_detail_id: driver_vehicle_id,
                },
              }
            );
          }
        }
      }

      updatedResponseData = await handleUpdatedAssignedLTS(
        driver_vehicle_id,
        res
      );
    }
    responseHandler(
      req,
      res,
      200,
      true,
      null,
      updatedResponseData,
      "LTS varieties updated successfully"
    );
  } catch (error) {
    responseHandler(
      req,
      res,
      500,
      false,
      "An error occurred while updating LTS varieties",
      error,
      null
    );
  }
};
