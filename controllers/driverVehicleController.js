// controllers/driverVehicleController.js

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
  getDriverListData,
  getLtsDataForDriver,
  getDriverData,
  countDriversByVehicleNumber,
} = require("../services/driverVehicleAllServices");
const softDeleteDriverDataServices = require("../services/softDeleteDriverDataServices");
exports.saveDriverVehicleDetails = async (req, res) => {
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

  const {
    vehicle_type_id,
    vehicle_number_ba_number,
    driver_name,
    driver_id_card_number,
    escort_number_rank_name,
    id_card_number_adhar_number_dc_number,
    unit,
    fmn_id,
    vehicle_capacity,
    resource,
    title,
    series,
    user_id,
  } = req.body;

  try {
    // Check if a record with the given vehicle number and series already exists
    const existingRecord = await db.DriverVehicleDetail.findOne({
      where: {
        vehicle_number_ba_number: vehicle_number_ba_number,
        series: series,
      },
    });

    if (existingRecord) {
      return responseHandler(
        req,
        res,
        400,
        false,
        "A vehicle with the same number and series already exists.",
        null
      );
    }

    let driverVehicle;
    let record_id = await fetchLatestRecordID();

    // Create a new record with created_at time
    driverVehicle = await db.DriverVehicleDetail.create({
      record_id: record_id,
      vehicle_type_id: vehicle_type_id ? vehicle_type_id : null,
      vehicle_number_ba_number: vehicle_number_ba_number
        ? vehicle_number_ba_number
        : null,
      driver_name: driver_name ? driver_name : null,
      driver_id_card_number: driver_id_card_number
        ? driver_id_card_number
        : null,
      escort_number_rank_name: escort_number_rank_name
        ? escort_number_rank_name
        : null,
      id_card_number_adhar_number_dc_number:
        id_card_number_adhar_number_dc_number
          ? id_card_number_adhar_number_dc_number
          : null,
      unit: unit ? unit : null,
      series: series ? series : null,
      fmn_id: fmn_id ? fmn_id : null,
      vehicle_capacity: vehicle_capacity ? vehicle_capacity : null,
      resource: resource ? resource : null,
      title: title ? title : null,
      created_by: user_id,
    });

    const driverData = await handleDriverVehicleDetailsSave(driverVehicle.id);

    responseHandler(
      req,
      res,
      200,
      true,
      "",
      driverData,
      "Driver data saved successfully"
    );
  } catch (error) {
    responseHandler(req, res, 500, false, "Server error", { error }, "");
  }
};

// to get the driver list data : including the pagination
exports.getDriverList = async (req, res) => {
  try {
    const keyword = req.query.keyword ? req.query.keyword.toString() : null;
    const series = req.query.series ? req.query.series.toString() : "";
    const limit = req.query.limit ? +req.query.limit : 10;
    const page = req.query.page ? +req.query.page : 1;
    const offset = page > 1 ? (page - 1) * limit : 0;
    const whereClause = {
      ...(keyword && {
        [Op.or]: [
          {
            unit: {
              [Op.like]: `%${keyword}%`,
            },
          },
          {
            resource: {
              [Op.like]: `%${keyword}%`,
            },
          },
          {
            vehicle_number_ba_number: {
              [Op.like]: `%${keyword}%`,
            },
          },
          {
            driver_name: {
              [Op.like]: `%${keyword}%`,
            },
          },
          {
            driver_id_card_number: {
              [Op.like]: `%${keyword}%`,
            },
          },
          {
            escort_number_rank_name: {
              [Op.like]: `%${keyword}%`,
            },
          },
          {
            id_card_number_adhar_number_dc_number: {
              [Op.like]: `%${keyword}%`,
            },
          },

          {
            title: {
              [Op.like]: `%${keyword}%`,
            },
          },
        ],
      }),
      id: {
        [db.Sequelize.Op.notIn]: [
          db.Sequelize.literal(
            `SELECT driver_vehicle_detail_id FROM assigned_lts_issue_voucher_details WHERE is_loaded = true`
          ),
        ],
      },
      end: null,
      ...(series && {
        series: series,
      }),
    };

    // Call the getDriverListData function to get driver data
    const driverList = await getDriverListData(whereClause, offset, limit);

    // Create an array to store LTS data for each driver
    const ltsDataPromises = driverList.map(async (driver) => {
      const ltsData = await getLtsDataForDriver(driver.id, driver.fmn_id);
      // Check if LTS data is assigned to this driver
      const assignedLTS = await db.AssignedLtsDetail.findOne({
        where: {
          driver_vehicle_detail_id: driver.id,
          [db.Sequelize.Op.or]: [
            { is_deleted: { [db.Sequelize.Op.is]: null } }, // Exclude null values
            { is_deleted: { [db.Sequelize.Op.is]: false } }, // Exclude false values
          ],
        },
        attributes: ["lts_issue_voucher_detail_id"],
      });

      return {
        ...driver.toJSON(),
        ltsData,
        assignedLTS,
        isLtsAssigned: !!assignedLTS, // True if LTS is assigned to this driver
      };
    });

    // Wait for all LTS data promises to resolve
    const driversWithLtsData = await Promise.all(ltsDataPromises);

    const totalCount = await db.DriverVehicleDetail.count({
      where: { ...whereClause },
    });
    const totalPage = parseInt(totalCount / limit) + 1;

    // Create the response structure
    const response = {
      driverList: driversWithLtsData,
      page,
      limit,
      totalCount,
      totalPage,
    };

    responseHandler(
      req,
      res,
      200,
      true,
      "",
      response,
      "Driver list fetched successfully"
    );
  } catch (error) {
    responseHandler(req, res, 500, false, "Server error", { error }, "");
  }
};

// update driver details from admin panel
exports.updateDriverVehicle = async (req, res) => {
  try {
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
    const { driver_Id } = req.params;

    // Check if the record with the specified driver_Id exists
    const existingDriver = await db.DriverVehicleDetail.findOne({
      where: {
        id: driver_Id,
      },
    });

    if (!existingDriver) {
      return responseHandler(
        req,
        res,
        404,
        false,
        "Driver record not found",
        null,
        ""
      );
    }

    const updateFields = {}; // Initialize an empty object to store the fields to be updated
    const {
      vehicle_type_id,
      vehicle_number_ba_number,
      vehicle_capacity,
      driver_name,
      driver_id_card_number,
      escort_number_rank_name,
      id_card_number_adhar_number_dc_number,
      unit,
      series,
      fmn_id,
      begin,
      end,
      resource,
      title,
      remark,
    } = req.body;

    // Check if a record with the given vehicle number and series already exists
    const existingRecord = await db.DriverVehicleDetail.findOne({
      where: {
        vehicle_number_ba_number: vehicle_number_ba_number,
        series: series,
        id: {
          [db.Sequelize.Op.not]: driver_Id, // Exclude the record with the specified ID
        },
      },
    });

    if (existingRecord) {
      return responseHandler(
        req,
        res,
        400,
        false,
        "A vehicle with the same number and series already exists.",
        null
      );
    }
    // Add the user_id as updated_by in updateFields
    const { user_id } = req.body;
    if (req.body.remark) {
      updateFields.updated_by = user_id;
    }

    // Check if each field exists in the req.body and add it to updateFields if it does
    const updateFieldsMap = {
      vehicle_type_id,
      vehicle_number_ba_number,
      vehicle_capacity,
      driver_name,
      driver_id_card_number,
      escort_number_rank_name,
      id_card_number_adhar_number_dc_number,
      unit,
      series,
      fmn_id,
      begin,
      end,
      resource,
      title,
      remark,
    };

    for (const field in updateFieldsMap) {
      if (req.body[field]) {
        updateFields[field] = req.body[field];
      } else {
        updateFields[field] = null;
      }
    }

    // Check if an LTS is assigned for the driver
    const assignedLtsData = await db.AssignedLtsDetail.findOne({
      where: {
        driver_vehicle_detail_id: driver_Id,
        [db.Sequelize.Op.or]: [
          { is_deleted: { [db.Sequelize.Op.is]: null } }, // Exclude null values
          { is_deleted: { [db.Sequelize.Op.is]: false } }, // Exclude false values
        ],
      },
      include: [
        {
          model: db.LtsDetail,
          as: "ltsDetail",
          attributes: ["fmn_id"],
        },
      ],
    });
    if (assignedLtsData) {
      // If an LTS is assigned, check formation ID
      const ltsFormationId = assignedLtsData.ltsDetail.fmn_id;

      if (ltsFormationId !== updateFields.fmn_id) {
        // Soft delete the assigned LTS if formation IDs are different
        await db.AssignedLtsDetail.update(
          { is_deleted: true },
          {
            where: {
              driver_vehicle_detail_id: driver_Id,
              [db.Sequelize.Op.or]: [
                { is_deleted: { [db.Sequelize.Op.is]: null } }, // Exclude null values
                { is_deleted: { [db.Sequelize.Op.is]: false } }, // Exclude false values
              ],
            },
          }
        );
      }
    }

    await db.DriverVehicleDetail.update(updateFields, {
      where: {
        id: driver_Id,
      },
    });

    responseHandler(
      req,
      res,
      200,
      true,
      "",
      null,
      "Driver details updated successfully."
    );
  } catch (error) {
    responseHandler(
      req,
      res,
      500,
      false,
      "An error occurred while updating Driver details",
      error,
      null
    );
  }
};

// get driver list in which lts not assigned.
exports.getDriverListNotLts = async (req, res) => {
  try {
    const assignedLtsDriver = await db.AssignedLtsDetail.findAll({
      attributes: ["driver_vehicle_detail_id"],
      where: {
        [Op.and]: [
          {
            [Op.or]: [{ is_deleted: null }, { is_deleted: false }],
          },
        ],
      },
    });
    const assignedLtsDriverIds = assignedLtsDriver.map(
      (item) => item.driver_vehicle_detail_id
    );
    // Query the DriverVehicleDetails table to find drivers without assigned LTS
    const driversWithoutLTS = await db.DriverVehicleDetail.findAll({
      where: {
        id: {
          [Op.notIn]: assignedLtsDriverIds,
        },
        begin: null,
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
        "resource",
        "title",
        "created_at",
        "remark",
      ],
      include: [
        // Include necessary associations to fetch related data

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

    // Send the list of drivers without assigned LTS as the response
    responseHandler(
      req,
      res,
      200,
      true,
      "",
      driversWithoutLTS,
      "Drivers without assigned LTS fetched successfully."
    );
  } catch (error) {
    responseHandler(
      req,
      res,
      500,
      false,
      "Internal server error",
      error.message
    );
  }
};

// get the driver data for print
exports.getDriverDataBYID = async (req, res) => {
  try {
    const { driver_Id } = req.params;

    // Query the DriverVehicleDetails table to find drivers without assigned LTS
    const driversDetails = await db.DriverVehicleDetail.findAll({
      where: {
        id: driver_Id,
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
        "resource",
        "title",
        "created_at",
        "remark",
      ],
      include: [
        // Include necessary associations to fetch related data

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

    // Send the list of drivers without assigned LTS as the response
    responseHandler(
      req,
      res,
      200,
      true,
      "",
      driversDetails,
      "Drivers without assigned LTS fetched successfully."
    );
  } catch (error) {
    responseHandler(
      req,
      res,
      500,
      false,
      "Internal server error",
      error.message
    );
  }
};

// get the vehicle details while adding the driver-vehicle
exports.getDriverVehicleDetail = async (req, res) => {
  try {
    const keyword = req.query.keyword ? req.query.keyword.toString() : null;
    const whereClause = {
      ...(keyword && {
        vehicle_number_ba_number: keyword,
      }),
    };
    // Call the getDriverData function to get driver data
    const driverList = await getDriverData(whereClause);
    const driverCount = await countDriversByVehicleNumber(whereClause);

    return responseHandler(
      req,
      res,
      200,
      true,
      "",
      { driverList, driverCount },
      "Driver list fetched successfully"
    );
  } catch (error) {
    responseHandler(req, res, 500, false, "Server error", { error }, "");
  }
};

// delete the driver data
exports.deleteDriverData = async (req, res) => {
  let transaction;
  try {
    // Start a database transaction
    transaction = await db.sequelize.transaction();
    const { startDate, endDate } = req.query; // Use req.query to get startDate and endDate from query parameters
    // Soft delete records within the specified date range
    const driverIds = await db.DriverVehicleDetail.findAll({
      where: {
        created_at: {
          [Op.gte]: startDate,
        },
        created_at: {
          [Op.lte]: endDate,
        },
      },
      attributes: ["id"],
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
        },
      ],
    });

    // Soft delete records within the specified date range
    const LTSIds = await db.LtsDetail.findAll({
      where: {
        created_at: {
          [Op.gte]: startDate,
        },
        created_at: {
          [Op.lte]: endDate,
        },
      },
      attributes: ["id"],
    });
    await softDeleteDriverDataServices.softDeleteDriverData(driverIds, LTSIds);

    // Commit the transaction if everything is successful
    await transaction.commit();
    return responseHandler(
      req,
      res,
      200,
      true,
      "",
      driverIds,
      "Driver delete successfully"
    );
  } catch (error) {
    if (transaction) {
      // Roll back the transaction if there's an error
      await transaction.rollback();
    }
    responseHandler(req, res, 500, false, "Server error", { error }, "");
  }
};

exports.driverCheckout = async (req, res) => {
  try {
    const { id, end, end_by } = req.body;
    const vehicle = await db.DriverVehicleDetail.findOne({ where: { id: id } });
    if (!vehicle) {
      return responseHandler(
        req,
        res,
        404,
        false,
        "Driver vehicle not found with provided details",
        {},
        ""
      );
    }
    vehicle.changed("updated_at", true);
    await vehicle.update({
      updated_at: new Date(),
      end: end,
      end_by: end_by,
    });
    responseHandler(req, res, 200, true, "", {}, "Timeout successful.");
  } catch (error) {
    responseHandler(req, res, 500, false, "Server error", { error }, "");
  }
};
// get vehicle list to print multiple vehicle data
exports.getDriverListMultiplePrint = async (req, res) => {
  try {
    const series = req.query.series ? req.query.series.toString() : "";
    const whereClause = {
      id: {
        [db.Sequelize.Op.notIn]: [
          db.Sequelize.literal(
            `SELECT driver_vehicle_detail_id FROM assigned_lts_issue_voucher_details WHERE is_loaded = true`
          ),
        ],
      },
      ...(series && {
        series: series,
      }),
    };

    // Call the getDriverListData function to get driver data
    const driverList = await getDriverListData(whereClause);

    // Create an array to store LTS data for each driver
    const ltsDataPromises = driverList.map(async (driver) => {
      const ltsData = await getLtsDataForDriver(driver.id, driver.fmn_id);
      // Check if LTS data is assigned to this driver
      const assignedLTS = await db.AssignedLtsDetail.findOne({
        where: {
          driver_vehicle_detail_id: driver.id,
        },
        attributes: ["lts_issue_voucher_detail_id"],
      });

      return {
        ...driver.toJSON(),
        ltsData,
        assignedLTS,
        isLtsAssigned: !!assignedLTS, // True if LTS is assigned to this driver
      };
    });

    // Wait for all LTS data promises to resolve
    const driversWithLtsData = await Promise.all(ltsDataPromises);

    responseHandler(
      req,
      res,
      200,
      true,
      "",
      driversWithLtsData,
      "Driver list fetched successfully"
    );
  } catch (error) {
    responseHandler(req, res, 500, false, "Server error", { error }, "");
  }
};
