// controllers/driverVehicleController.js

const db = require("../models");
const responseHandler = require("../helpers/responseHandler");
const { Op } = require("sequelize");
const { formatDateToYYYYMMDD } = require("../services/timeFormatServices");
const {generateBatches} = require("../controllers/manageSeriesControllers")

// Import sequelize connection from your models
const sequelize = db.sequelize;

// to get the driver list data
exports.getDashboardListData = async (req, res) => {
  try {
    // Parse date and formation ID from request parameters
    const { date_range, fmn_id, series_list } = req.params;
    const user_id = parseInt(req.header("user_id"));

    // Fetch series for the given user
    const seriesData = await db.Series.findOne();//{ where: { userId: user_id } }

    if (!seriesData) {
      responseHandler(req, res, 404, false, "No Series Found", { error }, "");
    }

    const { time, interval, startDate: strDate } = seriesData;
    const batches = generateBatches(strDate, time, interval);

    if (!batches?.length) {
      responseHandler(req, res, 404, false, "No Series Found", { error }, "");
    }

    // Set default values if not provided
    const currentDate = await formatDateToYYYYMMDD(new Date());
    const formationId = fmn_id || 0;
    const series = batches ? batches: [];

    // Define the start and end date range
    const startDate = date_range || currentDate;
    const endDate = new Date(new Date(startDate).getTime() + 52 * 60 * 60 * 1000);
    const formattedEndDate = await formatDateToYYYYMMDD(endDate);

    // Construct the WHERE condition
    let whereCondition = `b.deleted_at IS NULL AND b.created_at >= :startDate AND b.created_at < :endDate`;
    if (Number(formationId) !== 0) {
      whereCondition += ` AND b.fmn_id = :formationId`;
    }

    // console.log(whereCondition, 'SERIES', formationId, startDate, endDate)

    // Construct dynamic CASE statements for the provided series
    let caseStatements = series
      .map(
        (seriesName) => `
        MAX(CASE 
          WHEN b.series LIKE '%${seriesName}%' THEN 
            CASE 
              WHEN (SELECT IFNULL(end, '2') FROM driver_vehicle_details WHERE record_id = b.record_id AND deleted_at IS NULL) != '2' THEN 'Green' 
              WHEN (SELECT IFNULL(begin, '1') FROM driver_vehicle_details WHERE record_id = b.record_id AND deleted_at IS NULL) != '1' THEN 'Blue' 
              WHEN (SELECT IFNULL(vehicle_number_ba_number, '') = '' OR IFNULL(driver_name, '') = '' FROM driver_vehicle_details WHERE record_id = b.record_id AND deleted_at IS NULL) THEN 'Yellow' 
              ELSE 'No Activity' 
            END 
          ELSE NULL 
        END) AS \`${seriesName}\`
      `
      )
      .join(",");

    // Construct the full SQL query
    const sqlQuery = `
      SELECT 
        b.id, 
        b.record_id, 
        b.vehicle_number_ba_number, 
        ${caseStatements},
        f.formation_name,
        b.begin AS begin_time,
        b.end AS end_time
      FROM driver_vehicle_details b
      LEFT JOIN formations f ON f.id = b.fmn_id
      WHERE ${whereCondition}
      GROUP BY b.id, b.record_id, b.vehicle_number_ba_number
      ORDER BY b.id;
    `;

    // Execute the dynamic SQL query using Sequelize
    const results = await sequelize.query(sqlQuery, {
      replacements: { startDate, endDate: formattedEndDate, formationId },
      type: sequelize.QueryTypes.SELECT,
    });

    // console.log(results, 'result')

    // Return response
    responseHandler(req, res, 200, true, "", results, "Dashboard list fetched successfully");
  } catch (error) {
    responseHandler(req, res, 500, false, "Not Found", { error }, "");
  }
};



// exports.getDashboardListData = async (req, res) => {
//   try {
//     // Parse date and formation ID from request parameters
//     const { date_range, fmn_id } = req.params;
//     // Set default values if not provided
//     const currentDate = await formatDateToYYYYMMDD(new Date());
//     const formationId = fmn_id || 0;

//     // Execute the stored procedure using Sequelize
//     const results = await sequelize.query(`CALL sp_dms_dashboard_data(?, ?)`, {
//       replacements: [date_range || currentDate, formationId],

//     });
//     // Process the results as needed
//     const responseData = results; // Assuming the stored procedure returns the data you need

//     responseHandler(req,res, 200, true, "", responseData, "Dashboard list fetched successfully");
//   } catch (error) {
//     responseHandler(req,res, 500, false, "Server error", { error }, "");
//   }
// };

// to get the driver list data: including the pagination
exports.getMobileDashboardListData = async (req, res) => {
  try {
    // Parse date and formation ID from request parameters
    const { date_range, series } = req.params;
    // Set default values if not provided
    const currentDate = await formatDateToYYYYMMDD(new Date());

    // Execute the stored procedure using Sequelize
    const results = await sequelize.query(`CALL sp_mobile_dms_dashboard_data(?, ?)`, {
      replacements: [date_range || currentDate, series],

    });
    // Process the results as needed
    const responseData = results; // Assuming the stored procedure returns the data you need

    responseHandler(req,res, 200, true, "", responseData, "Dashboard list fetched successfully");
  } catch (error) {
    responseHandler(req,res, 500, false, "Server error", { error }, "");
  }
};
