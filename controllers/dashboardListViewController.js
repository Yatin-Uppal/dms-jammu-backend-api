// controllers/driverVehicleController.js

const db = require("../models");
const responseHandler = require("../helpers/responseHandler");
const { Op } = require("sequelize");
const { formatDateToYYYYMMDD } = require("../services/timeFormatServices");
const { generateBatches } = require("../controllers/manageSeriesControllers");
const { fetchDriverRecords } = require("../services/driverVehicleServices");

// to get the driver list data --original
// exports.getDashboardListData = async (req, res) => {
//   try {
//     // Parse date and formation ID from request parameters
//     const { date_range, fmn_id, series_list } = req.params;
//     const user_id = parseInt(req.header("user_id"));

//     // Fetch series for the given user
//     const seriesData = await db.Series.findOne();//{ where: { userId: user_id } }

//     console.log({ seriesData });
    

//     if (!seriesData) {
//       return responseHandler(req, res, 404, false, "No Series Found", {}, "");
//     }

//     const { time, interval, startDate: strDate } = seriesData;
//     const batches = generateBatches(strDate, time, interval);

//     console.log({ batches });
    

//     if (!batches?.length) {
//       return responseHandler(req, res, 404, false, "No Series Found", {}, "");
//     }

//     // Set default values if not provided
//     const currentDate = await formatDateToYYYYMMDD(new Date());
//     const formationId = fmn_id || 0;
//     const series = batches ? batches : [];

//     // Define the start and end date range
//     const startDate = date_range || currentDate;
//     const endDate = new Date(new Date(startDate).getTime() + 52 * 60 * 60 * 1000);
//     const formattedEndDate = await formatDateToYYYYMMDD(endDate);

//     console.log({ series });
    

//     // Construct the WHERE condition
//     let whereCondition = `b.deleted_at IS NULL AND b.created_at >= :startDate AND b.created_at < :endDate`;
//     if (Number(formationId) !== 0) {
//       whereCondition += ` AND b.fmn_id = :formationId`;
//     }

//     // console.log(whereCondition, 'SERIES', formationId, startDate, endDate)

//     // Construct dynamic CASE statements for the provided series
//     let caseStatements = series
//       .map(
//         (seriesName) => `
//         MAX(CASE 
//           WHEN b.series LIKE '%${seriesName}%' THEN 
//             CASE 
//               WHEN (SELECT IFNULL(end, '2') FROM driver_vehicle_details WHERE record_id = b.record_id AND deleted_at IS NULL) != '2' THEN 'Green' 
//               WHEN (SELECT IFNULL(begin, '1') FROM driver_vehicle_details WHERE record_id = b.record_id AND deleted_at IS NULL) != '1' THEN 'Blue' 
//               WHEN (SELECT IFNULL(vehicle_number_ba_number, '') = '' OR IFNULL(driver_name, '') = '' FROM driver_vehicle_details WHERE record_id = b.record_id AND deleted_at IS NULL) THEN 'Yellow' 
//               ELSE 'No Activity' 
//             END 
//           ELSE NULL 
//         END) AS \`${seriesName}\`
//       `
//       )
//       .join(",");

//     // Construct the full SQL query
//     const sqlQuery = `
//       SELECT 
//         b.id, 
//         b.record_id, 
//         b.vehicle_number_ba_number, 
//         ${caseStatements},
//         f.formation_name,
//         b.begin AS begin_time,
//         b.end AS end_time
//       FROM driver_vehicle_details b
//       LEFT JOIN formations f ON f.id = b.fmn_id
//       WHERE ${whereCondition}
//       GROUP BY b.id, b.record_id, b.vehicle_number_ba_number
//       ORDER BY b.id;
//     `;

//     // Execute the dynamic SQL query using Sequelize
//     const results = await db.sequelize.query(sqlQuery, {
//       replacements: { startDate, endDate: formattedEndDate, formationId },
//       type: db.sequelize.QueryTypes.SELECT,
//     });

//     console.log(results, 'result')

//     // Return response
//     responseHandler(req, res, 200, true, "", results, "Dashboard list fetched successfully");
//   } catch (error) {
//     console.log({error});
    
//     responseHandler(req, res, 500, false, "Not Found", { error }, "");
//   }
// };

// exports.getDashboardListData = async (req, res) => {
//   try {
//     const { date_range, fmn_id } = req.params;
//     const user_id = parseInt(req.header("user_id"));

//     const CHUNK_SIZE = 170;

//     const chunkArray = (arr, size) => {
//       const chunks = [];

//       for (let i = 0; i < arr.length; i += size) {
//         chunks.push(arr.slice(i, i + size));
//       }

//       return chunks;
//     };

//     const seriesData = await db.Series.findOne();

//     if (!seriesData) {
//       return responseHandler(
//         req,
//         res,
//         404,
//         false,
//         "No Series Found",
//         {},
//         ""
//       );
//     }

//     const { time, interval, startDate: strDate } = seriesData;

//     const batches = generateBatches(strDate, time, interval);

//     console.log("Total batches:", batches.length);

//     if (!batches?.length) {
//       return responseHandler(
//         req,
//         res,
//         404,
//         false,
//         "No Series Found",
//         {},
//         ""
//       );
//     }

//     const currentDate = await formatDateToYYYYMMDD(new Date());

//     const formationId = fmn_id || 0;
//     const startDate = date_range || currentDate;

//     const endDate = new Date(
//       new Date(startDate).getTime() + 52 * 60 * 60 * 1000
//     );

//     const formattedEndDate = await formatDateToYYYYMMDD(endDate);

//     let whereCondition =
//       "b.deleted_at IS NULL AND b.created_at >= :startDate AND b.created_at < :endDate";

//     if (Number(formationId) !== 0) {
//       whereCondition += " AND b.fmn_id = :formationId";
//     }

//     const seriesChunks = chunkArray(batches, CHUNK_SIZE);

//     console.log(
//       `Processing ${seriesChunks.length} chunks of ${CHUNK_SIZE}`
//     );

//     const mergedResults = new Map();

//     for (let chunkIndex = 0; chunkIndex < seriesChunks.length; chunkIndex++) {
//       const chunk = seriesChunks[chunkIndex];

//       console.log(
//         `Running chunk ${chunkIndex + 1}/${seriesChunks.length}`
//       );

//       const caseStatements = chunk
//         .map(
//           (seriesName) => `
//             MAX(
//               CASE
//                 WHEN b.series LIKE '%${seriesName}%'
//                 THEN
//                   CASE
//                     WHEN (
//                       SELECT IFNULL(end,'2')
//                       FROM driver_vehicle_details
//                       WHERE record_id = b.record_id
//                       AND deleted_at IS NULL
//                       LIMIT 1
//                     ) != '2'
//                     THEN 'Green'

//                     WHEN (
//                       SELECT IFNULL(begin,'1')
//                       FROM driver_vehicle_details
//                       WHERE record_id = b.record_id
//                       AND deleted_at IS NULL
//                       LIMIT 1
//                     ) != '1'
//                     THEN 'Blue'

//                     WHEN (
//                       SELECT
//                         IFNULL(vehicle_number_ba_number,'') = ''
//                         OR IFNULL(driver_name,'') = ''
//                       FROM driver_vehicle_details
//                       WHERE record_id = b.record_id
//                       AND deleted_at IS NULL
//                       LIMIT 1
//                     )
//                     THEN 'Yellow'

//                     ELSE 'No Activity'
//                   END
//                 ELSE NULL
//               END
//             ) AS \`${seriesName}\`
//           `
//         )
//         .join(",");

//       const sqlQuery = `
//         SELECT
//           b.id,
//           b.record_id,
//           b.vehicle_number_ba_number,
//           ${caseStatements},
//           f.formation_name,
//           b.begin AS begin_time,
//           b.end AS end_time
//         FROM driver_vehicle_details b
//         LEFT JOIN formations f
//           ON f.id = b.fmn_id
//         WHERE ${whereCondition}
//         GROUP BY
//           b.id,
//           b.record_id,
//           b.vehicle_number_ba_number
//         ORDER BY b.id
//       `;

//       const chunkResults = await db.sequelize.query(sqlQuery, {
//         replacements: {
//           startDate,
//           endDate: formattedEndDate,
//           formationId,
//         },
//         type: db.sequelize.QueryTypes.SELECT,
//       });

//       for (const row of chunkResults) {
//         const key = row.record_id;

//         if (!mergedResults.has(key)) {
//           mergedResults.set(key, { ...row });
//         } else {
//           Object.assign(mergedResults.get(key), row);
//         }
//       }
//     }

//     const finalResults = Array.from(mergedResults.values());

//     console.log(
//       `Final records returned: ${finalResults.length}`
//     );

//     return responseHandler(
//       req,
//       res,
//       200,
//       true,
//       "",
//       finalResults,
//       "Dashboard list fetched successfully"
//     );
//   } catch (error) {
//     console.error(error);

//     return responseHandler(
//       req,
//       res,
//       500,
//       false,
//       "Not Found",
//       { error },
//       ""
//     );
//   }
// };


exports.getDashboardListData = async (req, res) => {
  try {
    const { date_range, fmn_id } = req.params;
    const user_id = parseInt(req.header("user_id"));

    const seriesData = await db.Series.findOne();

    if (!seriesData) {
      return responseHandler(
        req,
        res,
        404,
        false,
        "No Series Found",
        {},
        ""
      );
    }

    const { time, interval, startDate: strDate } = seriesData;

    const batches = generateBatches(strDate, time, interval);

    if (!batches?.length) {
      return responseHandler(
        req,
        res,
        404,
        false,
        "No Series Found",
        {},
        ""
      );
    }

    const currentDate = await formatDateToYYYYMMDD(new Date());

    const formationId = fmn_id || 0;
    const startDate = date_range || currentDate;

    const endDate = new Date(
      new Date(startDate).getTime() + 52 * 60 * 60 * 1000
    );

    const formattedEndDate = await formatDateToYYYYMMDD(endDate);

    let whereCondition =
      "b.deleted_at IS NULL AND b.created_at >= :startDate AND b.created_at < :endDate";

    if (Number(formationId) !== 0) {
      whereCondition += " AND b.fmn_id = :formationId";
    }

    const sqlQuery = `
      SELECT
          b.id,
          b.record_id,
          b.vehicle_number_ba_number,
          b.series,
          f.formation_name,
          b.begin AS begin_time,
          b.end AS end_time,

         CASE
    WHEN b.end IS NOT NULL
    THEN 'Green'

    WHEN b.begin IS NOT NULL
    THEN 'Blue'

              WHEN (
                  COALESCE(b.vehicle_number_ba_number, '') = ''
                  OR COALESCE(b.driver_name, '') = ''
              )
              THEN 'Yellow'

              ELSE 'No Activity'
          END AS status

      FROM driver_vehicle_details b

      LEFT JOIN formations f
          ON f.id = b.fmn_id

      WHERE ${whereCondition}

      ORDER BY b.id
    `;

    const rows = await db.sequelize.query(sqlQuery, {
      replacements: {
        startDate,
        endDate: formattedEndDate,
        formationId,
      },
      type: db.sequelize.QueryTypes.SELECT,
    });

    const resultMap = new Map();

    for (const row of rows) {
      const key = `${row.id}_${row.record_id}_${row.vehicle_number_ba_number}`;

      if (!resultMap.has(key)) {
        resultMap.set(key, {
          id: row.id,
          record_id: row.record_id,
          vehicle_number_ba_number: row.vehicle_number_ba_number,
          formation_name: row.formation_name,
          begin_time: row.begin_time,
          end_time: row.end_time,
        });
      }

      const existing = resultMap.get(key);

      if (row.series) {
        existing[row.series] = row.status;
      }
    }

    // Preserve original response structure
    for (const item of resultMap.values()) {
      for (const seriesName of batches) {
        if (!Object.prototype.hasOwnProperty.call(item, seriesName)) {
          item[seriesName] = null;
        }
      }
    }

    const results = Array.from(resultMap.values());

    return responseHandler(
      req,
      res,
      200,
      true,
      "",
      results,
      "Dashboard list fetched successfully"
    );
  } catch (error) {
    console.error("getDashboardListData Error:", error);

    return responseHandler(
      req,
      res,
      500,
      false,
      "Not Found",
      {
        message: error.message,
        sqlMessage: error.parent?.sqlMessage,
      },
      ""
    );
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
    const results = await db.sequelize.query(`CALL sp_mobile_dms_dashboard_data(?, ?)`, {
      replacements: [date_range || currentDate, series],

    });
    if (!results || !results.length) {
      return responseHandler(req, res, 404, false, "No Data Found", [], "");
    }
    const driverIds = results.map((driver) => driver.id);
    const whereCondition = {
      id: {
        [Op.in]: driverIds
      }
    };
    // Process the results as needed
    const { data: driversResult, count } = await fetchDriverRecords(whereCondition);

    responseHandler(req,res, 200, true, "", driversResult, "Dashboard list fetched successfully");
  } catch (error) {
    console.log("🚀 ~ error:", error);
    responseHandler(req, res, 500, false, "Server error", { error: error.message }, "");
  }
};
