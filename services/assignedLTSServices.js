const responseHandler = require("../helpers/responseHandler");
const db = require("../models");
const { Op } = require("sequelize");

// Check if any of the lts_details_id is already assigned to the driver_vehicle_detail_id

exports.handleExistingAssignedLTS = async (
  driver_vehicle_detail_id,
  lts_issue_voucher_detail_id
) => {
  try {
    const existingAssignments = await db.AssignedLtsDetail.findAll({
      where: {
        driver_vehicle_detail_id,
        lts_issue_voucher_detail_id,
      },
      attributes: ["lts_issue_voucher_detail_id"],
    });

    const existingLtsIds = existingAssignments.map(
      (assignment) => assignment.lts_issue_voucher_detail_id
    );

    return existingLtsIds;
  } catch (error) {
    throw error;
  }
};

exports.handleFilterOldLTSDeleted = async (
  driver_vehicle_detail_id,
  lts_issue_voucher_detail_id
) => {
  try {
    const filterOldAssignmentsDeleted = await db.AssignedLtsDetail.findAll({
      where: {
        driver_vehicle_detail_id,
        lts_issue_voucher_detail_id,
        is_deleted: true,
      },
      attributes: ["id", "lts_issue_voucher_detail_id"],
    });
    const filterOldAssignmentsDeletedIds = filterOldAssignmentsDeleted.map(
      (assignment) => assignment.lts_issue_voucher_detail_id
    );

    return filterOldAssignmentsDeletedIds;
  } catch (error) {
    throw error;
  }
};
exports.handleCheckLTSAlreadyAssigned = async (lts_issue_voucher_detail_id) => {
  try {
    const assignedLTS = await db.AssignedLtsDetail.findAll({
      where: {
        lts_issue_voucher_detail_id,
        [db.Sequelize.Op.or]: [
          { is_deleted: { [db.Sequelize.Op.is]: null } }, // Exclude null values
          { is_deleted: { [db.Sequelize.Op.is]: false } }, // Exclude false values
        ],
      },
      attributes: ["lts_issue_voucher_detail_id"],
      include: [
        // Include the LTS details association here
        {
          model: db.LtsDetail,
          as: "ltsDetail",
          attributes: ["id", "name", "lts_date_and_time", "type"],
        },
      ],
    });

    const assignedLtsDetails = assignedLTS.map((assignment) => {
      return {
        lts_issue_voucher_detail_id: assignment.lts_issue_voucher_detail_id,
        lts_name: assignment.ltsDetail.load_telly_sheet_lts_number, // Access the LTS name
      };
    });

    return assignedLtsDetails;
  } catch (error) {
    throw error;
  }
};

exports.handleUpdateLTS = async (
  filterOldAssignmentsDeletedIds,
  driver_vehicle_detail_id,
  lts_issue_voucher_detail_id,
  user_id
) => {
  try {
    // Update records with is_deleted false and dates if necessary
    if (filterOldAssignmentsDeletedIds.length > 0) {
      await db.AssignedLtsDetail.update(
        {
          is_deleted: false,
          assigned_by: user_id,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          where: {
            driver_vehicle_detail_id,
            lts_issue_voucher_detail_id: {
              [Op.in]: filterOldAssignmentsDeletedIds, // Use Op.in to handle multiple IDs
            },
            is_deleted: true, // Only update if is_deleted is true
          },
        }
      );
    }
  } catch (error) {
    throw error;
  }
};

exports.handleCreateLTS = async (driver_vehicle_detail_id, res) => {
  try {
    const driverData = await db.DriverVehicleDetail.findOne({
      where: {
        id: driver_vehicle_detail_id, // Retrieve data for all assigned LTS records
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
        "fmn",
        "begin",
        "begin_by",
        "resource",
        "title",
      ],
      include: [
        {
          model: db.AssignedLtsDetail,
          as: "assignedLtsData",
          attributes: [
            "id",
            "driver_vehicle_detail_id",
            "lts_issue_voucher_detail_id",
            "assigned_by",
            "created_at",
          ],
          include: [
            {
              model: db.User,
              as: "assignedByUser",
              attributes: ["id", "username", "first_name", "last_name"],
              include: [
                { model: db.Role, as: "role_data", attributes: ["id", "role"] },
              ],
            },
            {
              model: db.LtsDetail,
              as: "ltsDetail",
              attributes: ["id", "name", "lts_date_and_time", "type"],
            },
          ],
          where: {
            [Op.or]: [{ is_deleted: null }, { is_deleted: false }],
          },
          required: false,
        },
        {
          model: db.VehicleType,
          as: "vehicleType",
          attributes: ["id", "vehicle_type"],
        },
        {
          model: db.VehicleCapacity,
          as: "VehicleCapacity",
          attributes: ["id", "capacity"],
        },
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
      ],
    });
    if (!driverData) {
      return responseHandler(req,res, 404, false, "Driver data not found", {}, "");
    }

    // Fetch LTS Varieties data
    const ltsVarieties = await db.LTSVariety.findAll({
      attributes: ["id", "lts_issue_voucher_id", "variety_id"],
      include: [
        {
          model: db.LtsDetail,
          as: "ltsDetail",
          attributes: ["id", "name", "lts_date_and_time", "type"],
        },
        {
          model: db.VarietyDetail,
          as: "varietyDetail",
          attributes: [
            "id",
            "lot",
            "skt_name",
            "amk_number",
            "nomenclature_ipq",
            "qty",
            "number_of_package",
            "location_33_fad",
            "fad_loading_point_lp_number",
          ],
        },
      ],
    });

    const groupedLTSDetails = ltsVarieties.reduce((acc, ltsVariety) => {
      const lts_id = ltsVariety.ltsDetail.id;

      if (!acc[lts_id]) {
        acc[lts_id] = {
          ltsDetail: ltsVariety.ltsDetail,
          varieties: [],
        };
      }
      // Create a variety object with LTSVariety IDs
      const variety = {
        ...ltsVariety.varietyDetail.dataValues,
        ltsVarietyIds: ltsVariety.id, // Add the LTSVariety ID to the array
      };

      acc[lts_id].varieties.push(variety);
      return acc;
    }, {});

    const groupedLTSDetailsArray = Object.values(groupedLTSDetails);

    // Integrate groupedLTSDetailsArray with driverData
    groupedLTSDetailsArray.forEach((groupedLTS) => {
      const foundLTS = driverData.assignedLtsData.find(
        (assignedLTS) =>
          assignedLTS.ltsDetail &&
          assignedLTS.ltsDetail.id === groupedLTS.ltsDetail.id
      );

      if (foundLTS) {
        foundLTS.setDataValue("varieties", groupedLTS.varieties);
      }
    });

    return driverData;
  } catch (error) {
    throw error;
  }
};
