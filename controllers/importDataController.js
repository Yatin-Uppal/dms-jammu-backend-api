const db = require("../models");
const responseHandler = require("../helpers/responseHandler");
const { validationResult } = require("express-validator");
const { Op } = require("sequelize");
const exceljs = require("exceljs");
const path = require("path"); // Add this import for file extension check
const fs = require("fs"); // Add this import for file check
const xlsx = require('xlsx');
const {
  handleDataConvert,
  storeBulkDriverData,
  transformData,
} = require("../services/importExcelFIleDataServices");
exports.excelImportData = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return responseHandler(req,
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
    if (!req.file) {
      return responseHandler(req,
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
      return responseHandler(req,
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
      return responseHandler(req,
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
    const workbook = xlsx.read(fileBuffer, { type: 'buffer' });


    // Assuming reading the first sheet
    const sheet = workbook.Sheets[workbook.SheetNames[0]];


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

    // Check if every row has the "Fmn" (Formation) information
    const formationValues = jsonData.map(row => row["Fmn"] || null);
    if (formationValues.includes(null)) {
      const errorMessages = formationValues.map((value, index) => {
        if (value === null) {
          return `Formation is missing in row ${index + 1}`;
        }
      }).filter(Boolean);
      return responseHandler(
        req,
        res,
        400,
        false,
        "Formation missing in some rows",
        { errors: errorMessages },
        ""
      );
    }
     
    const whereClause = {
      [db.Sequelize.Op.or]: [
        { is_deleted: { [db.Sequelize.Op.is]: null } }, // Exclude null values
        { is_deleted: { [db.Sequelize.Op.is]: false } }, // Exclude false values
      ],
    };
    let formationList = await db.formations.findAll({
      where: { ...whereClause },
      order: [["created_at", "DESC"]],
    });
    formationList = formationList.map((formation) => formation.formation_name);
    const formationValuesSet = new Set(formationValues);
    formationValuesSet.delete(null); // Remove null if it exists
    const missingFormations = [...formationValuesSet].filter(formation => !formationList.includes(formation));
    if (missingFormations.length > 0) {
      return responseHandler(
        req,
        res,
        400,
        false,
        "modalView",
        { formations: missingFormations },
        "Please create the formations first"
      );
    }

    const transformedData = await transformData(jsonData);
    const userId = req.headers.user_id
    // Insert the data into the database (uncomment this if you have the logic)
    await storeBulkDriverData(transformedData,userId);


    responseHandler(req,res, 200, true, "", transformedData, "Data uploaded Successfully");
  } catch (error) {
    responseHandler(req,res, 500, false, "Server error", { error });
  }
};
 