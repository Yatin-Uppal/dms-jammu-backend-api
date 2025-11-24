const db = require("../models");
const { Op } = require("sequelize");
const fs = require("fs")
const responseHandler = require("../helpers/responseHandler");
const { validationResult } = require("express-validator");
const {
  storeBulkAMKQuantityData,
} = require("../services/manageAmkQuantityServices");
const path = require("path");
const xlsx = require("xlsx");
const Excel = require("exceljs");
const {
  getAMKQuantityService,
  processResultData, getAMKUploadSheets,
} = require("../services/amkQuantityService");
const {excelTojson, validateExcelData, processRecordsInBatches} = require("../helpers/excelTojson");
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
    const { amk_number, location_33_fad, total_quantity, nomenclature, mmf, sec, a_u, remarks } = req.body;

    // Check if the combination already exists
    const existingRecord = await db.ManageAmkQuantity.findOne({
      where: {
        amk_number,
        location_33_fad,
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

    const maxSrNoRecord = await db.ManageAmkQuantity.findOne({
      attributes: [[db.sequelize.fn('MAX', db.sequelize.col('sr_no')), 'maxSrNo']],
      raw: true
    });

    const maxSrNo = maxSrNoRecord.maxSrNo || 0;

    const newSrNo = maxSrNo + 1;

    // If the combination doesn't exist, add the data to the database
    await db.ManageAmkQuantity.create({
      amk_number,
      location_33_fad,
      total_quantity,
      nomenclature,
      mmf,
      sec,
      a_u,
      sr_no: newSrNo,
      remarks: remarks ?? null,
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
    let { amk_number, location_33_fad, total_quantity, nomenclature, sec, mmf, a_u, remarks } = req.body;
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
    location_33_fad = location_33_fad || existData.location_33_fad;
    total_quantity = total_quantity || existData.total_quantity;
    nomenclature = nomenclature || existData.nomenclature;
    sec = sec || existData.sec;
    // mmf = mmf || existData.mmf;
    a_u = a_u || existData.a_u;
    remarks = remarks || existData.remarks;


    // Check if the combination already exists for other records
    const existingRecord = await db.ManageAmkQuantity.findOne({
      where: {
        amk_number,
        [db.Sequelize.Op.or]: [
          { is_deleted: { [db.Sequelize.Op.is]: null } }, // Exclude null values
          { is_deleted: { [db.Sequelize.Op.is]: false } }, // Exclude false values
        ],
        id: {
          [db.Sequelize.Op.not]: amk_id, // Exclude the current record being updated
        },
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
        location_33_fad,
        total_quantity,
        nomenclature,
        sec,
        a_u,
        mmf,
        remarks: remarks ?? null,
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

    responseHandler(req, res, 200, true, "", {}, "Data deleted successfully.");
  } catch (error) {
    responseHandler(req, res, 500, false, "Server error", { error }, "");
  }
};

exports.uploadAMKQuantity = async (req, res) => {
  try {
    if (!req.file) {
      return responseHandler(
        req,
        res,
        400,
        false,
        "No file uploaded.",
        {},
        "File not uploaded"
      );
    }

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

    // Check the file extension to allow xlsx, xlx, and ods formats
    const allowedExtensions = [".xlsx", ".xlx"];
    const fileExtension = path.extname(req.file.originalname);
    if (!allowedExtensions.includes(fileExtension)) {
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

    const fileBuffer = req.file.buffer;

    // Read the Excel file using xlsx
    const workbook = xlsx.read(fileBuffer, { type: "buffer" });

    // Assuming reading the first sheet
    const sheet = workbook.Sheets[workbook.SheetNames[0]];

    // Convert sheet to JSON
    const jsonData = xlsx.utils.sheet_to_json(sheet, {
      raw: false,
      dateNF: "yyyy-mm-dd h:mm:ss",
    });

    // Check if the sheet contains only headings (no actual data)
    if (jsonData.length <= 0) {
      return responseHandler(
        req,
        res,
        400,
        false,
        "File contains only headings.",
        {},
        "File contains only headings"
      );
    }
    // Insert the data into the database (uncomment this if you have the logic)
    await storeBulkAMKQuantityData(jsonData);

    responseHandler(
      req,
      res,
      200,
      true,
      "",
      jsonData,
      "Data uploaded Successfully"
    );
  } catch (error) {
    responseHandler(req, res, 500, false, "Server error", error);
  }
};

exports.uploadAMKQuantityNew = async (req, res) => {
    try {
      const store_type = 'ammunition'
      if (!req.file) {
        return res.status(400).json({ error: 'Please upload an Excel file' });
      }

      if (!store_type) {
        return res.status(400).json({ error: 'Store type is required' });
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

      const workbook = new Excel.Workbook();
      await workbook.xlsx.readFile(req.file.path);
      const worksheet = workbook.getWorksheet(1); // Get first worksheet
      const data = [];

      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return; // Skip header row
        data.push(excelTojson(row, store_type));
      });

      const errors = validateExcelData(data, store_type);

      if (errors.length > 0) {
        return res.status(400).json({
          errors: errors,
        });
      }

      let excelFileRecord;
      try {
          excelFileRecord = await db.AmkExcelSheets.create({
            file_id: req.file.filename,
            excel_file_name: req.file.originalname,
            uploaded_by: `${user.first_name} ${user.last_name}`,
            total_inventory_uploaded: data.length,
            store_type: store_type,
            is_deleted: false,
        });
      } catch (error) {
        console.error('Error processing Excel data:', error);
        return res.status(500).json({ error: 'Failed to process Excel data' });
      }

      try {
        const result = await processRecordsInBatches(data, excelFileRecord, db, 100);

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

    const templatePath = path.join(__dirname, '../templates' , 'tech_store_format.xlsx');
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
    const location_33_fad = req.query.location_33_fad
      ? req.query.location_33_fad.toString()
      : null;
    const total_quantity = req.query.total_quantity
      ? req.query.total_quantity
      : null;
    const page = req.query.page ? +req.query.page : 1;
    const limit = req.query.limit ? +req.query.limit : 10;
    const store_type = req.query.store_type ? req.query.store_type : null;

    const { amkQuantityData, totalCount, totalPage } =
      await getAMKQuantityService({
        amk_number,
        location_33_fad,
        total_quantity,
        page,
        limit,
        store_type,
      });
    let assignedData = await db.SktDetails.findAll({
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
          ],
        },
      ],
    });

    let loadData = await db.SktDetails.findAll({
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
              model: db.VarietyLoadStatusDetail,
              as: "sktvarietyLoadData",
              attributes: ["id", "skt_variety_id", "qty"],
            },
          ],
        },
      ],
    });
    const result = await processResultData(
      assignedData,
      loadData,
      amkQuantityData
    );

    responseHandler(
      req,
      res,
      200,
      true,
      "",
      { amkQuantityData: result, page, limit, totalCount, totalPage },
      "Amk Quantity fecthed successfully"
    );
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
