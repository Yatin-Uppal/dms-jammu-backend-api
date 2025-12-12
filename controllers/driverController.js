const db = require("../models");
const responseHandler = require("../helpers/responseHandler");
const { validationResult } = require("express-validator");
const { Op } = require("sequelize");
const {
  fetchRecordServices,
  fetchAmkListrecords,
} = require("../services/fecthRecordsServices");
const exceljs = require("exceljs");
const path = require("path");
const fs = require("fs");
const {
  formatDateToYYYYMMDD,
  formatTime,
} = require("../services/timeFormatServices");
const { transformLotDetails } = require("./varietiesLotsController");
const { getLocalIP } = require("../helpers/ipHandler");

exports.fetchDetails = async (req, res) => {
  // Validation
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return responseHandler(req, res, 400, false, "Validation errors", {
      errors: errors.array(),
    });
  }

  try {
    const { record_id } = req.params;

    // Fetch data based on record_id
    let driverData = await db.DriverVehicleDetail.findOne({
      where: { record_id },
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
        "end",
        "begin_by",
        "end_by",
        "resource",
        "title",
        "created_at",
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
            "is_loaded",
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
              include: [
                {
                  model: db.formations,
                  as: "formationData",
                  attributes: ["id", "formation_name"],
                },

                {
                  model: db.SktDetails,
                  as: "sktData",
                  attributes: ["id", "name"],
                  include: [
                    {
                      model: db.SktVarieties,
                      as: "sktvarityData",
                      attributes: ["id"],
                      include: [
                        {
                          model: db.VarietyDetail,
                          as: "varityData",
                          attributes: [
                            "id",
                            "amk_number",
                            "nomenclature",
                            "ipq",
                            "package_weight",
                            "qty",
                            "number_of_package",
                            "location_33_fad",
                            "fad_loading_point_lp_number",
                          ],
                        },
                        {
                          model: db.VarietiesLotDetails,
                          as: "sktVarietyLotData",
                          attributes: [
                            "id",
                            "driver_vehicle_id",
                            "skt_variety_id",
                            "lot_number",
                            "lot_quantity",
                            "qr_reference_id",
                            "load_status",
                            "loaded_by",
                            "loaded_time",
                          ],
                          include: [
                            {
                              model: db.User,
                              as: "LoadedUserData",
                              attributes: [
                                "id",
                                "username",
                                "first_name",
                                "last_name",
                              ],
                              include: [
                                {
                                  model: db.Role,
                                  as: "role_data",
                                  attributes: ["id", "role"],
                                },
                              ],
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
          where: {
            [Op.or]: [{ is_deleted: null }, { is_deleted: false }],
          },
          required: false,
        },
        {
          model: db.formations,
          as: "formation_details",
          attributes: ["id", "formation_name"],
        },
        {
          model: db.VehicleType,
          as: "vehicleType",
          attributes: ["id", "vehicle_type", "description"],
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
        {
          model: db.User,
          as: "endBy",
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
      return responseHandler(
        req,
        res,
        404,
        false,
        "Driver data not found",
        {},
        ""
      );
    } else {
      driverData = driverData.toJSON();
    }

    //--------------------------
    if (driverData.assignedLtsData.length > 0) {
      Promise.all(
        driverData.assignedLtsData.map(async (assignedLts) => {
          assignedLts.ltsDetail = transformLotDetails([assignedLts.ltsDetail]);
          assignedLts.isDuplicate = false;
          const match = await db.AssignedLtsDetail.findOne({
            where: {
              lts_issue_voucher_detail_id:
                assignedLts.lts_issue_voucher_detail_id,
              driver_vehicle_detail_id: {
                [db.Sequelize.Op.not]: assignedLts.driver_vehicle_detail_id,
              },
            },
          });
          if (match) {
            assignedLts.isDuplicate = true;
          } else {
            assignedLts.isDuplicate = false;
          }
          return assignedLts;
        })
      )
        .then((modifiedAssignedLtsData) => {
          // Now, modifiedAssignedLtsData contains the modified data
          driverData.assignedLtsData = modifiedAssignedLtsData;
          responseHandler(
            req,
            res,
            200,
            true,
            "",
            driverData,
            "Driver data fetched successfully!"
          );
        })
        .catch((error) => {
          console.log('error: ', error);
          responseHandler(req, res, 500, false, "Server error", { error }, "");
        });
    } else {
      // If there is no assigned LTS data, still send a response with the driverData
      responseHandler(
        req,
        res,
        200,
        true,
        "",
        driverData,
        "Driver data fetched successfully!"
      );
    }
  } catch (error) {
    responseHandler(req, res, 500, false, "Server error", { error }, "");
  }
};

exports.fetchRecords = async (req, res) => {
  // Validation
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return responseHandler(req, res, 400, false, "Validation errors", {
      errors: errors.array(),
    });
  }

  try {
    const {
      page = 1,
      limit = 10,
      record_id = "",
      driver_name = "",
      vehicle_number_ba_number = "",
      begin = "",
      end = "",
    } = req.query;

    const offset = (page - 1) * limit;
    const whereCondition = {
      ...(record_id && {
        record_id: { [Op.like]: `%${record_id}%` },
      }),
      ...(driver_name && {
        driver_name: { [Op.like]: `%${driver_name}%` },
      }),
      ...(vehicle_number_ba_number && {
        vehicle_number_ba_number: {
          [Op.like]: `%${vehicle_number_ba_number}%`,
        },
      }),
      ...(begin && {
        begin: {
          [Op.gte]: new Date(`${begin} 00:00:00`),
        },
      }),
      ...(end && {
        end: {
          [Op.lte]: new Date(`${end} 23:59:59`),
        },
      }),
    };
    // where condition for the asssing duplicate LTS  as we are using the same API to get the list of driver who have duplicate LTS
    const whereForAssignLts = {
      ...(req.query.lts_issue_voucher_detail_id &&
        req.query.driver_vehicle_detail_id && {
          lts_issue_voucher_detail_id: req.query.lts_issue_voucher_detail_id,
        }),
      ...(req.query.lts_issue_voucher_detail_id &&
        req.query.driver_vehicle_detail_id && {
          driver_vehicle_detail_id: {
            [Op.ne]: req.query.driver_vehicle_detail_id,
          },
        }),
      [db.Sequelize.Op.or]: [
        { is_deleted: { [db.Sequelize.Op.is]: null } }, // Exclude null values
        { is_deleted: { [db.Sequelize.Op.is]: false } }, // Exclude false values
      ],
    };

    // Fetch data based on query parameters
    const driverData = await db.DriverVehicleDetail.findAndCountAll({
      where: whereCondition,
      limit: parseInt(limit),
      offset: offset,
      order: [["begin", "DESC"]],
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
        "end",
        "begin_by",
        "end_by",
        "resource",
        "title",
        "created_at",
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
            "is_loaded",
            "created_at",
          ],
          where: whereForAssignLts,
          include: [
            {
              model: db.LtsDetail,
              as: "ltsDetail",
              attributes: ["id", "name", "lts_date_and_time", "type"],
              include: [
                {
                  model: db.SktDetails,
                  as: "sktData",
                  attributes: ["id", "name"],
                  include: [
                    {
                      model: db.SktVarieties,
                      as: "sktvarityData",
                      attributes: ["id", "variety_id", "skt_id"],
                      include: [
                        {
                          model: db.VarietyDetail,
                          as: "varityData",
                          attributes: [
                            "id",
                            "amk_number",
                            "nomenclature",
                            "qty"
                          ],
                        },
                        {
                          model: db.VarietiesLotDetails,
                          as: "sktVarietyLotData",
                        },
                      ],
                    },
                  ],
                }
              ]
            },
          ],
        },
        {
          model: db.VehicleType,
          as: "vehicleType",
          attributes: ["id", "vehicle_type", "description"],
        },
        {
          model: db.formations,
          as: "formation_details",
          attributes: ["id", "formation_name"],
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
        {
          model: db.User,
          as: "endBy",
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

    const allAssignedLtsDetails = await db.AssignedLtsDetail.findAll({
      where: {
        [db.Sequelize.Op.or]: [
          { is_deleted: { [db.Sequelize.Op.is]: null } }, // Exclude null values
          { is_deleted: { [db.Sequelize.Op.is]: false } }, // Exclude false values
        ],
      },
    });

    // Create a map to store lts_issue_voucher_detail_id to driver_vehicle_detail_id mapping
    const ltsDetailIds = {};

    // Iterate through allAssignedLtsDetails and populate the map
    for (const ltsData of allAssignedLtsDetails) {
      const ltsIssueVoucherDetailId = ltsData.lts_issue_voucher_detail_id;
      const driverVehicleDetailId = ltsData.driver_vehicle_detail_id;

      // Store the driver_vehicle_detail_id for each lts_issue_voucher_detail_id
      if (!ltsDetailIds[ltsIssueVoucherDetailId]) {
        ltsDetailIds[ltsIssueVoucherDetailId] = [driverVehicleDetailId];
      } else {
        ltsDetailIds[ltsIssueVoucherDetailId].push(driverVehicleDetailId);
      }
    }

    // Iterate through the driverData rows and check for duplicates
    let driversResult = driverData.rows.map(row => row.toJSON());

    // Build transformed result
    driversResult = driversResult.map(row => {
      const assignedLtsData = row.assignedLtsData || [];
      let isDuplicate = false;

      const transformedAssigned = assignedLtsData.map(ltsData => {
        const voucherId = ltsData.lts_issue_voucher_detail_id;

        // Duplicate logic
        if (ltsDetailIds[voucherId] && ltsDetailIds[voucherId].length > 1) {
          isDuplicate = true;
        }

        // Transform LOT details (always pure JSON now)
        return {
          ...ltsData,
          ltsDetail: transformLotDetails([ltsData.ltsDetail])[0],
        };
      });

      return {
        ...row,
        assignedLtsData: transformedAssigned,
        isDuplicate,
      };
    });


    if (!driverData) {
      return responseHandler(
        req,
        res,
        404,
        false,
        "Driver data not found",
        {},
        ""
      );
    }

    const totalPages = Math.ceil(driverData.count / limit);

    const modifiedDriverData = {
      total_records: driverData.count,
      limit: parseInt(limit),
      page: parseInt(page),
      total_pages: totalPages,
      records: driversResult,
    };

    responseHandler(
      req,
      res,
      200,
      true,
      "",
      modifiedDriverData,
      "Driver data fetched successfully!"
    );
  } catch (error) {
    responseHandler(req, res, 500, false, "Server error", { error }, "");
  }
};

exports.downloadExcel = async (req, res) => {
  try {
    const fetchData = await fetchRecordServices(req, res);

    if (fetchData.length <= 0) {
      return responseHandler(req, res, 404, false, "No data for download.", "");
    }

    const workbook = new exceljs.Workbook();
    // const summaryWorksheet = workbook.addWorksheet("SummaryReport");
    const driverWorksheet = workbook.addWorksheet("Drawal Report");

    // Create a new array to store the modified data
    const modifiedExcelData = [];

    // Find the maximum number of LTS and Varieties
    let maxLtsCount = 0;
    let maxSktCount = 0;
    let maxVarietiesCount = 0;
    let maxQtycount = 1;
    fetchData.forEach((record) => {
      if (record?.assignedLtsData?.length > maxLtsCount) {
        maxLtsCount = record.assignedLtsData.length;
      }
      record.assignedLtsData.forEach((assignedLts) => {
        if (assignedLts?.ltsDetail?.sktData?.length > maxSktCount) {
          maxSktCount = assignedLts?.ltsDetail?.sktData.length;
        }
        assignedLts?.ltsDetail?.sktData.forEach((varities) => {
          if (varities?.sktvarityData?.length > maxVarietiesCount) {
            maxVarietiesCount = varities?.sktvarityData?.length;
          }
          varities?.sktvarityData.length > 0 &&
            varities?.sktvarityData.forEach((varity) => {
              if (varity?.sktvarietyLoadData.length > 0) {
                varity?.sktvarietyLoadData.forEach((loadDetails) => {
                  if (
                    loadDetails?.lot_number &&
                    loadDetails?.lot_number.length &&
                    loadDetails?.lot_number.includes(",")
                  ) {
                    let count = loadDetails?.lot_number.split(",").length;
                    maxQtycount = count > maxQtycount ? count : maxQtycount;
                  }
                });
              }
            });
        });
      });
    });

    //--------------headers

    const driverHeaders = [
      "Sr No.",
      "Record ID",
      "Driver Name",
      "Driver ID Card Number",
      "Escort Number/ Rank Name",
      "ID Card Number/ Adhar number/ DC Number",
      "Resource",
      "Title",
      "Unit",
      "FMN",
      "Vehicle Number / BA Number",
      "Vehicle Type",
      "Vehicle Capacity",
      "Begin",
      "In Time",
      "End",
      "Duration",
      "In Time By",
      "End By",
    ];
    // Create LTS headers
    const ltsHeaders = [];
    for (let i = 1; i <= maxLtsCount; i++) {
      ltsHeaders.push(
        `${i}. Load Tally Sheet LTS No. / Issue Voucher`,
        `${i}. Type`,
        `${i}. LTS Date and Time`
        // `${i}. Assigned By `
      );

      // Add headers for SKT and its varieties
      for (let j = 1; j <= maxSktCount; j++) {
        ltsHeaders.push(`${j}. Location`);

        // Add headers for each variety under SKT
        for (let k = 1; k <= maxVarietiesCount; k++) {
          ltsHeaders.push(
            `${k}. AMK Number`,
            `${k}. Nomenclature`,
            `${k}. IPQ`,
            `${k}. Package Weight`,
            `${k}. Qty Nos.`,
            `${k}. Number of Packages`,
            `${k}. SKT Name`,
            `${k}. FAD Loading Point LP No.`
          );

          for (let q = 1; q <= maxQtycount; q++) {
            // Push Quantity and Lot Number headers based on maxQtycount
            ltsHeaders.push(`${q}. Quantity `, `${q}. Lot Number`);
          }
          ltsHeaders.push(`${k}. Loaded By`, `${k}. Loaded Time`);
        }
      }
    }

    //-------
    const allHeaders = [...driverHeaders, ...ltsHeaders];
    fetchData.forEach((record, index) => {
      const beginDate = record.begin;
      const driverRow = [
        index + 1,
        record.record_id || "",
        record.driver_name || "",
        record.driver_id_card_number || "",
        record.escort_number_rank_name || "",
        record.id_card_number_adhar_number_dc_number || "",
        record.resource || "",
        record.title || "",
        record.unit || "",
        record.formation_details?.formation_name || "",
        record.vehicle_number_ba_number || "",
        record.vehicleType ? record.vehicleType.vehicle_type : "",
        record.vehicle_capacity || "",
        formatDateToYYYYMMDD(record.created_at) || "",
        formatDateToYYYYMMDD(beginDate) || "",
        formatDateToYYYYMMDD(record.end) || "",
        formatTime(beginDate, record.end) || "",
        (record?.beginBy?.first_name || "") +
          " " +
          (record?.beginBy?.last_name || ""),
        (record?.endBy?.first_name || "") +
          " " +
          (record?.endBy?.last_name || ""),
      ];
      const driverLtsAndVarietiesRow = [];
      const ltsVaritiesRow = [];
      record.assignedLtsData.forEach((assignedLts) => {
        ltsVaritiesRow.push(assignedLts.ltsDetail.name || "");
        ltsVaritiesRow.push((assignedLts.ltsDetail.type === "issue_voucher" ? "Issue Voucher" : "Load Tally Sheet") || "");
        ltsVaritiesRow.push(
          formatDateToYYYYMMDD(assignedLts.ltsDetail.lts_date_and_time) || ""
        );
        // ltsVaritiesRow.push((assignedLts.assignedByUser.first_name || "") + " " + (assignedLts.assignedByUser.last_name || ""));

        assignedLts.ltsDetail.sktData.forEach((sktData) => {
          ltsVaritiesRow.push(sktData.name);
          sktData.sktvarityData.forEach((sktVarityData) => {
            ltsVaritiesRow.push(sktVarityData.varityData[0].amk_number || "");
            ltsVaritiesRow.push(sktVarityData.varityData[0].nomenclature || "");
            ltsVaritiesRow.push(sktVarityData.varityData[0].ipq || "");
            ltsVaritiesRow.push(
              sktVarityData.varityData[0].package_weight || ""
            );
            ltsVaritiesRow.push(sktVarityData.varityData[0].qty || "");
            ltsVaritiesRow.push(
              sktVarityData.varityData[0].number_of_package || ""
            );
            ltsVaritiesRow.push(
              sktVarityData.varityData[0].location_33_fad || ""
            );
            ltsVaritiesRow.push(
              sktVarityData.fad_loading_point_lp_number || ""
            );
            let lotNumberValues = sktVarityData?.sktvarietyLoadData[0]
              ?.lot_number
              ? sktVarityData?.sktvarietyLoadData[0]?.lot_number.split(",")
              : [];
            let qtyValues = sktVarityData?.sktvarietyLoadData[0]?.qty
              ? sktVarityData?.sktvarietyLoadData[0]?.qty.split(",")
              : [];
            for (let i = 0; i < maxQtycount; i++) {
              ltsVaritiesRow.push(qtyValues[i] || "");
              ltsVaritiesRow.push(lotNumberValues[i] || "");
            }
            ltsVaritiesRow.push(
              (sktVarityData?.sktvarietyLoadData[0]?.LoadedUserData
                ?.first_name || "") +
                " " +
                (sktVarityData?.sktvarietyLoadData[0]?.LoadedUserData
                  ?.last_name || "")
            );
            ltsVaritiesRow.push(
              formatDateToYYYYMMDD(
                sktVarityData?.sktvarietyLoadData[0]?.loaded_time
              ) || ""
            );
          });
          for (
            let i = sktData.sktvarityData.length;
            i <= maxVarietiesCount - 1;
            i++
          ) {
            ltsVaritiesRow.push("", "", "", "", "", "", "", "", "", "");
            for (let i = 0; i < maxQtycount; i++) {
              ltsVaritiesRow.push("", "");
            }
          }
        });
        for (
          let i = assignedLts.ltsDetail.sktData.length;
          i <= maxSktCount - 1;
          i++
        ) {
          ltsVaritiesRow.push("");
        }
      });
      driverLtsAndVarietiesRow.push(ltsVaritiesRow);

      driverLtsAndVarietiesRow.forEach((ltsAndVarietiesRow) => {
        modifiedExcelData.push([...driverRow, ...ltsAndVarietiesRow]);
      });
    });
    driverWorksheet.addRows([allHeaders, ...modifiedExcelData]);
    // Define the style for the header row
    const headerStyle = {
      font: { bold: true },
      fill: { type: "pattern", pattern: "solid", fgColor: { argb: "EAEAEA" } },
    };

    // Set header row style
    driverWorksheet.getRow(1).eachCell((cell) => {
      cell.font = headerStyle.font;
      cell.fill = headerStyle.fill;
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });
    // Calculate the last row and last column that have data
    const lastRowWithData = modifiedExcelData.length + 1; // +1 for the header row
    const lastColumnWithData = allHeaders.length;

    // Apply bold borders to cells within the data range in driverWorksheet
    for (let row = 1; row <= lastRowWithData; row++) {
      for (let col = 1; col <= lastColumnWithData; col++) {
        const cell = driverWorksheet.getCell(row, col);
        if (cell.value) {
          cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
          };
        }
      }
    }
    // // Identify the quantity column indices dynamically
    // const quantityColumnIndices = [];
    // allHeaders.forEach((header, index) => {
    //   if (header.toLowerCase().includes("qty")) {
    //     quantityColumnIndices.push(index);
    //   }
    // });

    // // Calculate the total quantity
    // const totalQuantity = modifiedExcelData.reduce((total, record) => {
    //   const recordQuantity = quantityColumnIndices.reduce(
    //     (rowTotal, columnIndex) =>
    //       rowTotal + parseFloat(record[columnIndex] || 0),
    //     0
    //   );
    //   return total + recordQuantity;
    // }, 0);
    // // Calculate the total duration in seconds
    // const totalDurationInSeconds = modifiedExcelData.reduce((total, record) => {
    //   const begin = record[15];
    //   const end = record[16];
    //   const durationInSeconds = calculateDurationInSeconds(begin, end) || 0; // Use your duration calculation logic
    //   return total + durationInSeconds;
    // }, 0);
    // const totalVehicles = modifiedExcelData.length;

    // // Create the summary worksheet
    // const summaryHeaders = ["Summary Report", ""];
    // const summaryValues = [
    //   ["Total Tonnage:", totalQuantity],
    //   ["Total Duration:", parseDuration(totalDurationInSeconds)],
    //   ["Total Vehicles:", totalVehicles],
    // ];

    // // Add the summary headers and values to the worksheet
    // summaryWorksheet.addRows([summaryHeaders, ...summaryValues]);

    // // Set the style for the summary headers cell
    // summaryWorksheet.getCell("A1").font = { bold: true };
    // summaryWorksheet.getCell("A1").fill = {
    //   type: "pattern",
    //   pattern: "solid",
    //   fgColor: { argb: "EAEAEA" },
    // };
    // summaryWorksheet.getCell("A1").border = {
    //   top: { style: "thin" },
    //   left: { style: "thin" },
    //   bottom: { style: "thin" },
    //   right: { style: "thin" },
    // };

    // // Apply bold borders to non-empty cells in summaryWorksheet
    // summaryWorksheet.eachRow((row) => {
    //   row.eachCell((cell) => {
    //     cell.border = {
    //       top: { style: "thin" },
    //       left: { style: "thin" },
    //       bottom: { style: "thin" },
    //       right: { style: "thin" },
    //     };
    //   });
    // });

    // // Merge the cells for the summary header cell
    // summaryWorksheet.mergeCells("A1:B1");

    // // Set the style for the summary values cells
    // for (let row = 2; row <= summaryValues.length + 1; row++) {
    //   for (let col = 1; col <= 1; col++) {
    //     summaryWorksheet.getCell(row, col).font = { bold: true };
    //   }
    // }

    // Write the Excel file
    // const timestamp = formatexcelFileTime();
    const excelFileName = `Drawal Report_${Math.random()}.xlsx`;
    const excelFilePath = path.join(__dirname, "../public", excelFileName);

    await workbook.xlsx.writeFile(excelFilePath);

    // Set the appropriate headers for downloading
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${excelFileName}`
    );

    const fileStream = fs.createReadStream(excelFilePath);
    fileStream.pipe(res);

    // Construct the URL to download the Excel file
    // const URL = process.env.BASE_URL || "http://192.168.0.7:8080/";
    console.log(getLocalIP());
    
    const URL = process.env.BASE_URL || `http://${getLocalIP()}:8080/`;
    const excelFileURL = `${URL}${excelFileName}`; // Adjust the URL as needed

    // Schedule the deletion of the file after 1 minute
    setTimeout(() => {
      if (fs.existsSync(excelFilePath)) {
        fs.unlinkSync(excelFilePath);
      }
      // Delete the file
    }, 2 * 1000);

    // Response with success message and download URL
    responseHandler(
      req,
      res,
      200,
      true,
      "",
      { excelFileURL },
      "Excel file generated successfully!"
    );
  } catch (error) {
    responseHandler(
      req,
      res,
      500,
      false,
      "Error generating Excel file",
      { error },
      ""
    );
  }
};

exports.downloadAmkreport = async (req, res) => {
  try {
    let records = await fetchAmkListrecords(req, res);
    if (records.length <= 0) {
      return responseHandler(req, res, 404, false, "No data for download.", "");
    }
    const workbook = new exceljs.Workbook();
    const worksheet = workbook.addWorksheet("Amk Tonnage Report");

    // Define headers
    const headers = [
      "Amk Number",
      "Nomenclature",
      "Qty",
      "Total Tonnage",
      "Unit",
      "Formation",
    ];

    // Set column widths based on the header length
    headers.forEach((header, index) => {
      const column = worksheet.getColumn(index + 1);
      column.width = Math.max(15, header.length * 1.5); // Minimum width of 15
    });

    // Map the records to match the headers
    const data = [];
    let previousAMK = null;
    let totalTonnage = 0;
    // Initialize a variable to track the row where total tonnage is inserted
    let totalTonnageRow = [];
    for (const record of records) {
      const amkNumber = record["AMK NUMBER"] || "";
      const nomenclature = record["NOMENCLATURE"] || "";
      const qty = record["QUANTITY"] || "";
      const tonnage = record["TONNAGE"] || "";
      const unit = record["UNIT"] || "";
      const formation = record["FORMATION"] || "";

      if (amkNumber !== previousAMK && previousAMK !== null) {
        // Insert a row for the total tonnage after each unique AMK number

        data.push(["", "", "", totalTonnage, "", ""]);
        // Store the row number where total tonnage is inserted
        totalTonnageRow.push(data.length + 1);

        totalTonnage = 0;
      }

      data.push([amkNumber, nomenclature, qty, tonnage, unit, formation]);
      totalTonnage += parseFloat(tonnage) || 0;

      previousAMK = amkNumber;
    }

    // Insert the last total tonnage row
    if (previousAMK !== null) {
      data.push(["", "", "", totalTonnage, "", ""]);
      // Store the row number where the last total tonnage is inserted
      totalTonnageRow.push(data.length + 1);
    }

    // Add the headers and values to the worksheet
    worksheet.addRows([headers, ...data]);

    // Define the style for the header row
    const headerStyle = {
      font: { bold: true },
      fill: { type: "pattern", pattern: "solid", fgColor: { argb: "EAEAEA" } },
    };
    // Apply bold and light gray background color to the total tonnage row
    if (totalTonnageRow && totalTonnageRow.length > 0) {
      totalTonnageRow.map((value, index) => {
        worksheet.getRow(value).eachCell((cell) => {
          if (cell.value !== "") {
            cell.font = { bold: true };
            cell.fill = {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: "EAEAEA" }, // Light gray background color
            };
          }
        });
      });
    }

    // Set header row style
    worksheet.getRow(1).eachCell((cell) => {
      cell.font = headerStyle.font;
      cell.fill = headerStyle.fill;
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });

    // Calculate the last row and last column that have data
    const lastRowWithData = data.length + 1; // +1 for the header row
    const lastColumnWithData = headers.length;

    // Apply bold borders to cells within the data range
    for (let row = 1; row <= lastRowWithData; row++) {
      for (let col = 1; col <= lastColumnWithData; col++) {
        const cell = worksheet.getCell(row, col);
        if (cell.value) {
          cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
          };
        }
      }
    }

    // Merge cells for duplicate AMK numbers and center-align the value
    let consecutiveCount = 0;
    for (let row = 1; row <= lastRowWithData; row++) {
      const currentAMK = worksheet.getCell(row, 1).value;
      if (currentAMK === previousAMK) {
        consecutiveCount++;
        worksheet.getCell(row, 1).value = ""; // Clear the duplicate value
      } else {
        if (consecutiveCount > 0) {
          // Merge cells for the previous consecutive duplicates
          worksheet.mergeCells(row - consecutiveCount - 1, 1, row - 1, 1);
          // // Center-align the AMK number in the merged cell
          // worksheet.getCell(row - consecutiveCount, 1).alignment = {
          //   horizontal: "center",
          //   vertical: "middle",
          // };
        }
        consecutiveCount = 0;
      }
      previousAMK = currentAMK;
    }

    // Write the Excel file
    // const timestamp = formatexcelFileTime();
    // const fileName = rand()
    const excelFileName = `Amk_Tonnage_${Math.random()}.xlsx`;
    const excelFilePath = path.join(__dirname, "../public", excelFileName);

    await workbook.xlsx.writeFile(excelFilePath);

    // Set the appropriate headers for downloading
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${excelFileName}`
    );

    const fileStream = fs.createReadStream(excelFilePath);
    fileStream.pipe(res);

    // Construct the URL to download the Excel file
    // const URL = process.env.BASE_URL || "http://192.168.0.7:8080/";
    console.log(getLocalIP());
    
    const BASE_URL = process.env.BASE_URL || `http://${getLocalIP()}:8080/`;
    const excelFileURL = `${BASE_URL}${excelFileName}`;

    // Schedule the deletion of the file after 1 minute

    setTimeout(() => {
      if (fs.existsSync(excelFilePath)) {
        fs.unlinkSync(excelFilePath);
      }
      // Delete the file
    }, 2 * 1000);
    // Response with success message and download URL
    return responseHandler(
      req,
      res,
      200,
      true,
      "",
      { excelFileURL },
      "Excel file generated successfully!"
    );
  } catch (error) {
    return responseHandler(req, res, 500, true, "Server Error", {}, "");
  }
};

// fetch records by series
exports.fetchRecordsBySeries = async (req, res) => {
  // Validation
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return responseHandler(req, res, 400, false, "Validation errors", {
      errors: errors.array(),
    });
  }

  try {
    const { series } = req.query;

    const whereCondition = {
      ...(series && {
        series: { [Op.like]: `%${series}%` },
      }),
      id: {
        [db.Sequelize.Op.notIn]: [
          db.Sequelize.literal(
            `SELECT driver_vehicle_id FROM variety_load_status_details WHERE is_loaded = true`
          ),
        ],
      },
    };
    // Fetch data based on record_id
    let driverData = await db.DriverVehicleDetail.findAll({
      where: whereCondition,
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
        "end",
        "begin_by",
        "end_by",
        "resource",
        "title",
        "created_at",
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
            "is_loaded",
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
              include: [
                {
                  model: db.formations,
                  as: "formationData",
                  attributes: ["id", "formation_name"],
                },

                {
                  model: db.SktDetails,
                  as: "sktData",
                  attributes: ["id", "name"],
                  include: [
                    {
                      model: db.SktVarieties,
                      as: "sktvarityData",
                      attributes: ["id"],
                      include: [
                        {
                          model: db.VarietyDetail,
                          as: "varityData",
                          attributes: [
                            "id",
                            "amk_number",
                            "nomenclature",
                            "ipq",
                            "package_weight",
                            "qty",
                            "number_of_package",
                            "location_33_fad",
                            "fad_loading_point_lp_number",
                          ],
                        },
                        {
                          model: db.VarietiesLotDetails,
                          as: "sktVarietyLotData",
                          attributes: [
                            "id",
                            "driver_vehicle_id",
                            "skt_variety_id",
                            "lot_number",
                            "lot_quantity",
                            "load_status",
                            "loaded_by",
                            "loaded_time",
                          ],
                          include: [
                            {
                              model: db.User,
                              as: "LoadedUserData",
                              attributes: [
                                "id",
                                "username",
                                "first_name",
                                "last_name",
                              ],
                              include: [
                                {
                                  model: db.Role,
                                  as: "role_data",
                                  attributes: ["id", "role"],
                                },
                              ],
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
          where: {
            [Op.or]: [{ is_deleted: null }, { is_deleted: false }],
          },
          required: true,
        },
        {
          model: db.formations,
          as: "formation_details",
          attributes: ["id", "formation_name"],
        },
        {
          model: db.VehicleType,
          as: "vehicleType",
          attributes: ["id", "vehicle_type", "description"],
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
        {
          model: db.User,
          as: "endBy",
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
      return responseHandler(
        req,
        res,
        404,
        false,
        "Driver data not found",
        {},
        ""
      );
    }


  

    // If there is no assigned LTS data, still send a response with the driverData
    responseHandler(
      req,
      res,
      200,
      true,
      "",
      driverData,
      "Driver data fetched successfully!"
    );
  } catch (error) {
    responseHandler(req, res, 500, false, "Server error", { error }, "");
  }
};
