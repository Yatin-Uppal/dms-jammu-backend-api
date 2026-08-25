const db = require("../models");
const { Op } = require("sequelize");
const fs = require("fs")
const responseHandler = require("../helpers/responseHandler");
const { validationResult } = require("express-validator");
const path = require("path");
const xlsx = require("xlsx");
const Excel = require("exceljs");
const {
  getAMKQuantityService,
  processResultData,
  calculateAssignedAndLoadedQuantity,
  getAMKUploadSheets,
} = require("../services/amkQuantityService");
const { yymmddToDate } = require("../services/timeFormatServices");
const { validateExcelData, processRecordsInBatches } = require("../helpers/excelTojson");
const generateQrCode = require("../helpers/qrCodeGenerator");
exports.storeAMKQuantity = async (req, res) => {
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
    const { amk_number, amn_shelf_life, location, total_quantity, nomenclature } = req.body;

    // Check if the combination already exists
    const existingRecord = await db.ManageAmkQuantity.findOne({
      where: {
        amk_number,
        location,
        [db.Sequelize.Op.or]: [
          { is_deleted: { [db.Sequelize.Op.is]: null } }, // Exclude null values
          { is_deleted: { [db.Sequelize.Op.is]: false } }, // Exclude false values
        ],
      },
    });

    if (existingRecord) {
      return responseHandler(
        req,
        res,
        400,
        false,
        "AMK number already exists in the same location.",
        {},
        ""
      );
    }

    // If the combination doesn't exist, add the data to the database
    await db.ManageAmkQuantity.create({
      amk_number,
      amn_shelf_life,
      location,
      total_quantity,
      nomenclature
    });

    responseHandler(req, res, 200, true, "", {}, "Data stored successfully.");
  } catch (error) {
    responseHandler(req, res, 500, false, "Server error", { error }, "");
  }
};

exports.updateAMKQuantity = async (req, res) => {
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
    let { amk_number, amn_shelf_life, location, total_quantity, nomenclature } = req.body;
    const { amk_id } = req.params;

    const existData = await db.ManageAmkQuantity.findOne({
      where: {
        [db.Sequelize.Op.or]: [
          { is_deleted: { [db.Sequelize.Op.is]: null } }, // Exclude null values
          { is_deleted: { [db.Sequelize.Op.is]: false } }, // Exclude false values
        ],
        id: amk_id,
      },
    });

    if (!existData) {
      return responseHandler(
        req,
        res,
        400,
        false,
        "AMK quantity data not found.",
        {},
        ""
      );
    }

    amk_number = amk_number || existData.amk_number;
    amn_shelf_life = amn_shelf_life || existData.amn_shelf_life;
    location = location || existData.location;
    total_quantity = existData.total_quantity;
    nomenclature = existData.nomenclature;


    // Check if the combination already exists for other records
    const existingRecord = await db.ManageAmkQuantity.findOne({
      where: {
        amk_number,
        location,
        [db.Sequelize.Op.or]: [
          { is_deleted: { [db.Sequelize.Op.is]: null } }, // Exclude null values
          { is_deleted: { [db.Sequelize.Op.is]: false } }, // Exclude false values
        ],
        id: {
          [db.Sequelize.Op.ne]: amk_id,
        }
      },
    });

    if (existingRecord) {
      return responseHandler(
        req,
        res,
        400,
        false,
        "AMK number already exists in the same location.",
        {},
        ""
      );
    }

    // Update the data for the specified ID
    const [updatedRecord] = await db.ManageAmkQuantity.update(
      {
        amk_number,
        amn_shelf_life,
        location,
        total_quantity,
        nomenclature
      },
      {
        where: {
          id: amk_id,
          [db.Sequelize.Op.or]: [
            { is_deleted: { [db.Sequelize.Op.is]: null } }, // Exclude null values
            { is_deleted: { [db.Sequelize.Op.is]: false } }, // Exclude false values
          ],
        },
      }
    );

    if (updatedRecord[0] === 0) {
      // If no records were updated, it means the specified ID doesn't exist
      return responseHandler(
        req,
        res,
        404,
        false,
        "Record not found",
        {},
        "Record not found."
      );
    }

    responseHandler(req, res, 200, true, "", {}, "Data updated successfully");
  } catch (error) {
    responseHandler(req, res, 500, false, "Server error", { error }, "");
  }
};

exports.updateAmkLotQuantity = async (req, res) => {
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
    const { amk_id } = req.params;
    const lotDetails = req.body;

    const existData = await db.ManageAmkQuantity.findOne({
      where: {
        [db.Sequelize.Op.or]: [
          { is_deleted: { [db.Sequelize.Op.is]: null } }, // Exclude null values
          { is_deleted: { [db.Sequelize.Op.is]: false } }, // Exclude false values
        ],
        id: amk_id,
      },
    });

    if (!existData) {
      return responseHandler(req, res, 400, false, "AMK Quantity not found", {}, "");
    }

    await db.AmkLotDetails.destroy({
      where: {
        amk_id,
        [db.Sequelize.Op.or]: [
          { is_deleted: { [db.Sequelize.Op.is]: null } }, // Exclude null values
          { is_deleted: { [db.Sequelize.Op.is]: false } }, // Exclude false values
        ],
      },
    });

    let totalQuantity = 0;
    for (const lot of lotDetails) {
      const { lot_number, lot_quantity, condition, pkg_type } = lot;
      await db.AmkLotDetails.create({
        lot_number,
        lot_quantity,
        condition,
        pkg_type,
        amk_id,
        qr_code: generateQrCode(existData.location, existData.amk_number, lot_number, lot_quantity, condition, pkg_type),
        manufacture_date: yymmddToDate(lot_number?.split("/")[0]),
      });
      totalQuantity += Number(lot_quantity);
    }
    await db.ManageAmkQuantity.update(
      {
        total_quantity: totalQuantity,
      },
      {
        where: {
          id: amk_id,
        },
      }
    );

    responseHandler(req, res, 200, true, "", {}, "Lot details updated successfully");
  } catch (error) {
    responseHandler(req, res, 500, false, "Server error", { error }, "");
  }
}

exports.deleteAMKQuantity = async (req, res) => {
  // Validation
  try {
    const { amk_id } = req.params;

    const existData = await db.ManageAmkQuantity.findOne({
      where: {
        [db.Sequelize.Op.or]: [
          { is_deleted: { [db.Sequelize.Op.is]: null } }, // Exclude null values
          { is_deleted: { [db.Sequelize.Op.is]: false } }, // Exclude false values
        ],
        id: amk_id,
      },
    });

    if (!existData) {
      return responseHandler(
        req,
        res,
        400,
        false,
        "AMK quantity data not found.",
        {},
        ""
      );
    }

    await db.ManageAmkQuantity.update(
      {
        is_deleted: true,
      },
      {
        where: {
          id: amk_id,
          [db.Sequelize.Op.or]: [
            { is_deleted: { [db.Sequelize.Op.is]: null } }, // Exclude null values
            { is_deleted: { [db.Sequelize.Op.is]: false } }, // Exclude false values
          ],
        },
      }
    );

    await db.AmkLotDetails.destroy({
      where: {
        amk_id,
        [db.Sequelize.Op.or]: [
          { is_deleted: { [db.Sequelize.Op.is]: null } }, // Exclude null values
          { is_deleted: { [db.Sequelize.Op.is]: false } }, // Exclude false values
        ],
      },
    });

    responseHandler(req, res, 200, true, "", {}, "Data deleted successfully.");
  } catch (error) {
    responseHandler(req, res, 500, false, "Server error", { error }, "");
  }
};

exports.uploadAMKQuantity = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Please upload an Excel file' });
    }

    const user = req.user;
    // Check for empty file
    if (req.file.size === 0) {
      return responseHandler(
        req,
        res,
        400,
        false,
        "Empty file uploaded.",
        {},
        "Empty file"
      );
    }

    const allowedExtensions = [".xlsx", ".xlx"];
    const fileExtension = path.extname(req.file.originalname);
    if (!allowedExtensions.includes(fileExtension)) {
      // Delete the file after sending the response
      return responseHandler(
        req,
        res,
        400,
        false,
        "Invalid file format.",
        {},
        "Invalid file format"
      );
    }

    const workbook = xlsx.readFile(req.file.path);
    const data = [];

    // Assuming reading the first sheet
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    // Validate the sheet required headers
    const range = xlsx.utils.decode_range(sheet["!ref"]);
    const headers = [];

    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cellAddress = xlsx.utils.encode_cell({ r: 0, c: C });
      headers.push(sheet[cellAddress]?.v || "");
    }
    // Convert sheet to JSON
    const jsonData = xlsx.utils.sheet_to_json(sheet, {
      raw: false,
      dateNF: "yyyy-mm-dd h:mm:ss",
    });

    // Check if the sheet contains only headings (no actual data)
    if (jsonData.length <= 0) {
      return responseHandler(req,
        res,
        400,
        false,
        "File contains only headings.",
        {},
        "File contains only headings"
      );
    }

    const errors = validateExcelData(headers, jsonData);

    if (errors.length > 0) {
      return responseHandler(req, res, 400, false, "Invalid sheet", { errors }, "");
    }

    let excelFileRecord;
    try {
      excelFileRecord = await db.AmkExcelSheets.create({
        file_id: req.file.filename,
        excel_file_name: req.file.originalname,
        uploaded_by: `${user.first_name} ${user.last_name}`,
        total_inventory_uploaded: jsonData.length,
        store_type: "ammunition",
        is_deleted: false,
      });
    } catch (error) {
      console.error('Error processing Excel data:', error);
      return res.status(500).json({ error: 'Failed to process Excel data' });
    }

    try {
      const result = await processRecordsInBatches(jsonData, excelFileRecord, db, 100);

      if (result.errorCount > 0) {
        console.warn(`${result.errorCount} records had errors during processing.`);
      }

      const uploadData = {
        totalProcessed: result.totalProcessed,
        successCount: result.successCount,
        data: result.results,
        errorCount: result.errorCount,
      };
      return responseHandler(req, res, 200, true, "", uploadData, "Data uploaded Successfully");

    } catch (error) {
      console.error('Failed to process records:', error);
      throw new Error("Failed to process records");
    }

  } catch (e) {
    return responseHandler(req, res, 500, false, e, {}, "Server error");
  }
}

exports.downloadExcelFormat = async (req, res) => {
  try {
    const workbook = new Excel.Workbook();
    const worksheet = workbook.addWorksheet('Template');

    // Add headers
    worksheet.columns = [
      { header: 'SR_NO', key: 'sr_no', width: 20 },
      { header: 'SEC', key: 'sec', width: 10 },
      { header: 'PART_NO', key: 'amk_number', width: 30 },
      { header: 'NOMENCLATURE', key: 'nomenclature', width: 15 },
      { header: 'A_U', key: 'a_u', width: 15 },
      { header: 'AVL', key: 'total_quantity', width: 15 },
      { header: 'MMF', key: 'mmf', width: 15 },
      { header: 'REMARKS', key: 'remarks', width: 15 }
    ];
    // Style the headers
    worksheet.getRow(1).font = { bold: false, name: 'Calibri', size: 10 };
    worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'lightGray',
      bgColor: { argb: '67AE6E' } // Use ARGB format for the color
    };

    const templatePath = path.join(__dirname, '../templates', 'tech_store_format.xlsx');
    await workbook.xlsx.writeFile(templatePath);

    res.download(templatePath, 'Inventory_upload_format.xlsx');
  } catch (error) {
    res.status(500).json({
      error: 'Error generating template',
      details: error.message
    });
  }
}


exports.getAMKQuantity = async (req, res) => {
  try {
    const amk_number = req.query.amk_number
      ? req.query.amk_number.toString()
      : null;
    const location = req.query.location
      ? req.query.location.toString()
      : null;
    const sortedColumn = req.query.sortedColumn
      ? req.query.sortedColumn
      : 'amk_number';
    const stock_status = req.query.stock_status
      ? req.query.stock_status.toString()
      : 'all';
    const page = req.query.page ? +req.query.page : 1;
    const limit = req.query.limit ? +req.query.limit : 10;

    if (!["location", "amk_number"].includes(sortedColumn)) {
      return responseHandler(req, res, 400, false, "Invalid table column for sorting", {}, "");
    }

    let amkAssignedData = await db.SktDetails.findAll({
      attributes: ["name"],
      where: {
        [db.Sequelize.Op.or]: [
          { deleted_at: { [db.Sequelize.Op.is]: null } }, // Exclude false values
        ],
      },
      include: [
        // Include the LTS details association here
        {
          model: db.SktVarieties,
          as: "sktvarityData",
          attributes: ["id"],
          include: [
            {
              model: db.VarietyDetail,
              as: "varityData",
              attributes: ["id", "amk_number", "qty", "number_of_package"],
            },
            {
              model: db.VarietyLoadDetails,
              as: "varietyLoadData",
              attributes: ["id", "skt_variety_id", "lot_number", "lot_quantity", "load_status", "loaded_time"],
              required: false,
            },
          ],
        },
      ],
    });

    const { amkQuantityData, totalCount, totalPage } =
      await getAMKQuantityService({
        amk_number,
        location,
        sortedColumn,
        stock_status,
        page,
        limit,
        amkAssignedData,
      });

    responseHandler(
      req,
      res,
      200,
      true,
      "",
      { amkQuantityData, page, limit, totalCount, totalPage },
      "Amk Quantity fetched successfully"
    );
  } catch (error) {
    console.error("Error fetching AMK Quantity:", error);
    responseHandler(req, res, 500, false, "Server error", { error }, "");
  }
};

exports.getAmkLotDetails = async (req, res) => {
  try {
    const location = req.query?.location || null;
    const amk_number = req.query?.amk_number || null;
    const isAssigning = req.query?.is_assigning || null;
    const amkLotData = await db.ManageAmkQuantity.findAll({
      where: {
        ...(location && { location }),
        ...(amk_number && { amk_number }),
        [db.Sequelize.Op.or]: [
          { is_deleted: { [db.Sequelize.Op.is]: null } },
          { is_deleted: { [db.Sequelize.Op.is]: false } },
        ],
      },

      attributes: ["id", "amk_number", "location", "amn_shelf_life", "total_quantity", "created_at"],

      include: ((location && amk_number) || isAssigning)
        ? [{
          model: db.AmkLotDetails,
          as: "amkLotDetails",
          required: false
        }]
        : [],

      order: [
        ["created_at", "DESC"],
        ...(((location && amk_number) || isAssigning)
          ? [[{ model: db.AmkLotDetails, as: "amkLotDetails" }, "manufacture_date", "ASC"]]
          : [])
      ],

      distinct: true
    });

    let amkAssignedData = await db.SktDetails.findAll({
      attributes: ["name"],
      where: {
        [db.Sequelize.Op.or]: [
          { deleted_at: { [db.Sequelize.Op.is]: null } },
        ],
      },
      include: [
        {
          model: db.SktVarieties,
          as: "sktvarityData",
          attributes: ["id"],
          include: [
            {
              model: db.VarietyDetail,
              as: "varityData",
              attributes: ["id", "amk_number", "qty", "number_of_package"],
            },
            {
              model: db.VarietyLoadDetails,
              as: "varietyLoadData",
              attributes: ["id", "skt_variety_id", "lot_number", "lot_quantity", "load_status", "loaded_time"],
              required: false,
            },
          ],
        },
      ],
    });

    let lotQtyMap = {};
    if ((location && amk_number) || isAssigning) {
      const lotWiseQty = await db.VarietyLoadDetails.findAll({
        attributes: [
          "lot_number",
          [
            db.Sequelize.literal(
              `SUM(CASE WHEN load_status = 'Pending' AND loaded_time IS NULL THEN lot_quantity ELSE 0 END)`
            ),
            "assigned_quantity",
          ],
          [
            db.Sequelize.literal(
              `SUM(CASE WHEN load_status != 'Pending' THEN lot_quantity ELSE 0 END)`
            ),
            "loaded_quantity",
          ],
        ],
        group: ["lot_number"],
        raw: true,
      });

      lotQtyMap = lotWiseQty.reduce((acc, row) => {
        acc[row.lot_number] = {
          assigned_quantity: Number(row.assigned_quantity || 0),
          loaded_quantity: Number(row.loaded_quantity || 0),
        };
        return acc;
      }, {});
    }

    const lotDetails = amkLotData.map(amk => {
      const calculatedQuantity = calculateAssignedAndLoadedQuantity(
        amkAssignedData,
        amk.amk_number,
        amk.location
      );

      const assignedQuantity = calculatedQuantity.totalAssignedQuantity || 0;
      const loadedQuantity = calculatedQuantity.totalLoadedQuantity || 0;

      const amkLotDetails = (location && amk_number) || isAssigning ? amk.amkLotDetails.map(lot => {
        const lotTotals = lotQtyMap[lot.lot_number] || {
          assigned_quantity: 0,
          loaded_quantity: 0,
        };

        return {
          id: lot.id,
          lot_number: lot.lot_number,
          lot_quantity: lot.lot_quantity,
          condition: lot.condition,
          pkg_type: lot.pkg_type,
          manufacture_date: lot.manufacture_date,
          qr_code: lot.qr_code,
          assigned_quantity: lotTotals.assigned_quantity.toFixed(2),
          loaded_quantity: lotTotals.loaded_quantity.toFixed(2),
        };
      })?.filter(Boolean) : [];

      return {
        id: amk.id,
        amk_number: amk.amk_number,
        location: amk.location,
        amn_shelf_life: amk.amn_shelf_life,
        total_quantity: amk.total_quantity,
        assigned_quantity: assignedQuantity.toFixed(2),
        loaded_quantity: loadedQuantity.toFixed(2),
        balance_quantity: (Number(amk.total_quantity) - assignedQuantity).toFixed(2),
        actual_quantity: (Number(amk.total_quantity) - loadedQuantity).toFixed(2),
        ...((location && amk_number) || isAssigning) && { amkLotDetails },
      };
    });

    responseHandler(req, res, 200, true, "", lotDetails, "AMK details fetched successfully");
  } catch (error) {
    responseHandler(req, res, 500, false, "Server error", { error }, "");
  }
};

exports.sheetUploadHistory = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;
    const startDate = req.query.startDate || null;
    const endDate = req.query.endDate || null;

    // Extract optional search/filter parameters
    const searchTerm = req.query.search || '';
    const storeType = req.query.store_type || '';

    // Build filter conditions
    const whereClause = {};

    if (searchTerm) {
      whereClause[Op.or] = [
        { excel_file_name: { [Op.like]: `%${searchTerm}%` } },
      ];
    }

    if (storeType) {
      whereClause.store_type = storeType;
    }

    if (startDate && endDate) {
      // Make sure dates are in the correct format for SQL comparison
      whereClause.created_at = {
        [Op.between]: [startDate, endDate]
      };
    } else if (startDate) {
      whereClause.created_at = {
        [Op.gte]: startDate
      };
    } else if (endDate) {
      whereClause.created_at = {
        [Op.lte]: endDate
      };
    }

    const excelData = await getAMKUploadSheets(whereClause, limit, offset, page);

    return responseHandler(req, res, 200, true, "", excelData, "File Data Fetched Successfully");
  } catch (e) {
    return responseHandler(req, res, 500, false, "Server error", { error }, "");
  }
}

exports.downloadSheetById = async (req, res) => {
  try {
    const filename = req.params.sheet_id;

    // For security, validate the filename to prevent directory traversal attacks
    if (filename.includes('..')) {
      return res.status(400).send('Invalid filename');
    }

    // Construct the file path
    const filePath = path.join(__dirname, '../uploads/amk_excel_files', filename);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).send('File not found');
    }

    // Set headers for file download
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);

    // Send the file
    res.sendFile(filePath);
  } catch (error) {
    console.error('Download error:', error);
    responseHandler(req, res, 500, false, "Server error", { error }, "");
  }
}
