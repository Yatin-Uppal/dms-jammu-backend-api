const db = require("../models");
const responseHandler = require("../helpers/responseHandler");
const { validationResult } = require("express-validator");
const { Op } = require("sequelize");
const path = require("path");
const xlsx = require("xlsx");
const {
  storeBulkDriverData,
  transformData,
  validatedAmkQuantities,
} = require("../services/importExcelFIleDataServices");

exports.excelImportData = async (req, res) => {
  try {
    const isConfirmed =
      req.query.confirm === "true" ||
      req.body.confirm === "true" ||
      req.body.confirm === true;

    // 1. Basic validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return responseHandler(
        req,
        res,
        400,
        false,
        "Validation errors",
        { errors: errors.array() },
        ""
      );
    }

    // 2. File existence check
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

    // 3. File size check
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

    // 4. File extension check (.xlsx, .xlx, .xls)
    const allowedExtensions = [".xlsx", ".xlx", ".xls"];
    const fileExtension = path.extname(req.file.originalname).toLowerCase();
    if (!allowedExtensions.includes(fileExtension)) {
      return responseHandler(
        req,
        res,
        400,
        false,
        "Invalid file format. Please upload a .xlsx or .xls Excel file.",
        {},
        "Invalid file format"
      );
    }

    // 5. Read workbook
    const fileBuffer = req.file.buffer;
    const workbook = xlsx.read(fileBuffer, { type: "buffer" });
    if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
      return responseHandler(
        req,
        res,
        400,
        false,
        "Excel file contains no sheets.",
        {},
        "Invalid Excel file"
      );
    }

    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = xlsx.utils.sheet_to_json(sheet, {
      raw: false,
      dateNF: "yyyy-mm-dd h:mm:ss",
    });

    if (jsonData.length <= 0) {
      return responseHandler(
        req,
        res,
        400,
        false,
        "File contains only headings or is empty.",
        {},
        "File contains only headings"
      );
    }

    // 6. High-Priority Integrity Check: Fmn AND Unit must BOTH be present and non-empty in every single row
    const missingFieldErrors = [];
    for (let index = 0; index < jsonData.length; index++) {
      const row = jsonData[index];
      const rowNumber = index + 2; // Row 1 is header
      const fmnRaw = row["Fmn"] || row["fmn"] || row["Formation"];
      const unitRaw = row["Unit"] || row["unit"] || row["Unit Name"];

      const fmnValue = fmnRaw !== undefined && fmnRaw !== null ? String(fmnRaw).trim() : "";
      const unitValue = unitRaw !== undefined && unitRaw !== null ? String(unitRaw).trim() : "";

      if (!fmnValue && !unitValue) {
        missingFieldErrors.push({
          row: rowNumber,
          error: `Row ${rowNumber}: Both Formation ('Fmn') and Unit ('Unit') are missing.`,
        });
      } else if (!fmnValue) {
        missingFieldErrors.push({
          row: rowNumber,
          error: `Row ${rowNumber}: Formation ('Fmn') is missing.`,
        });
      } else if (!unitValue) {
        missingFieldErrors.push({
          row: rowNumber,
          error: `Row ${rowNumber}: Unit ('Unit') is missing.`,
        });
      }
    }

    if (missingFieldErrors.length > 0) {
      return responseHandler(
        req,
        res,
        400,
        false,
        "Missing required fields: Both Formation ('Fmn') and Unit ('Unit') are mandatory for every row.",
        {
          errorType: "MISSING_REQUIRED_FIELDS",
          totalRows: jsonData.length,
          errors: missingFieldErrors,
        },
        "Validation failed"
      );
    }

    // 7. Check if all formations in the sheet exist in DB
    const allDbFormations = await db.formations.findAll({
      where: {
        [Op.or]: [
          { is_deleted: { [Op.is]: null } },
          { is_deleted: false },
        ],
      },
    });

    const formationMapByName = new Map();
    allDbFormations.forEach((f) => {
      formationMapByName.set(f.formation_name.toLowerCase().trim(), f);
    });

    const invalidFormations = [];
    const seenFormationErrors = new Set();

    for (let index = 0; index < jsonData.length; index++) {
      const row = jsonData[index];
      const rowNumber = index + 2;
      const fmnName = String(row["Fmn"] || row["fmn"] || row["Formation"]).trim();
      const unitName = String(row["Unit"] || row["unit"] || row["Unit Name"]).trim();

      if (!formationMapByName.has(fmnName.toLowerCase())) {
        if (!seenFormationErrors.has(fmnName.toLowerCase())) {
          seenFormationErrors.add(fmnName.toLowerCase());
          invalidFormations.push({
            row: rowNumber,
            unit_name: unitName,
            formation_name: fmnName,
            error: `Formation '${fmnName}' does not exist in the system.`,
          });
        }
      }
    }

    if (invalidFormations.length > 0) {
      return responseHandler(
        req,
        res,
        400,
        false,
        "One or more formations specified in the Excel sheet do not exist. Please create them before importing.",
        {
          errorType: "INVALID_FORMATIONS",
          totalRows: jsonData.length,
          invalidFormations,
          formations: invalidFormations.map((item) => item.formation_name),
        },
        "Invalid formations"
      );
    }

    // 8. Intra-file conflicting unit assignments check
    // Ensure the same unit name is not mapped to multiple different formations in the same Excel file
    const fileUnitFormationMap = new Map();
    const conflictingUnits = [];

    for (let index = 0; index < jsonData.length; index++) {
      const row = jsonData[index];
      const rowNumber = index + 2;
      const fmnName = String(row["Fmn"] || row["fmn"] || row["Formation"]).trim();
      const unitName = String(row["Unit"] || row["unit"] || row["Unit Name"]).trim();
      const unitKey = unitName.toLowerCase();

      if (fileUnitFormationMap.has(unitKey)) {
        const firstEntry = fileUnitFormationMap.get(unitKey);
        if (firstEntry.formation_name.toLowerCase() !== fmnName.toLowerCase()) {
          conflictingUnits.push({
            row: rowNumber,
            unit_name: unitName,
            formation_name: fmnName,
            first_row: firstEntry.row,
            first_formation_name: firstEntry.formation_name,
            error: `Unit '${unitName}' is assigned to '${firstEntry.formation_name}' (row ${firstEntry.row}) and '${fmnName}' (row ${rowNumber}) in the same file.`,
          });
        }
      } else {
        fileUnitFormationMap.set(unitKey, {
          row: rowNumber,
          unit_name: unitName,
          formation_name: fmnName,
        });
      }
    }

    if (conflictingUnits.length > 0) {
      return responseHandler(
        req,
        res,
        400,
        false,
        "Conflicting unit-formation mappings in the Excel file. A unit cannot belong to multiple formations.",
        {
          errorType: "CONFLICTING_UNITS_IN_EXCEL",
          totalRows: jsonData.length,
          conflictingUnits,
        },
        "Conflicting units in file"
      );
    }

    // 9. Check Unit-Formation Relationships against DB
    const uniqueUnitNames = Array.from(fileUnitFormationMap.values()).map(
      (item) => item.unit_name
    );

    const existingDbUnits = await db.ArmyUnit.findAll({
      where: {
        unit_name: uniqueUnitNames,
        [Op.or]: [
          { is_deleted: { [Op.is]: null } },
          { is_deleted: false },
        ],
      },
      include: [
        {
          model: db.formations,
          as: "formationData",
          attributes: ["id", "formation_name"],
        },
      ],
    });

    const existingDbUnitMap = new Map();
    existingDbUnits.forEach((u) => {
      existingDbUnitMap.set(u.unit_name.toLowerCase().trim(), u);
    });

    const toCreate = []; // New units (do not exist in DB)
    const toUpdate = []; // Existing units with different or null fmn_id
    const unchanged = []; // Existing units already assigned to this formation

    for (const fileUnit of fileUnitFormationMap.values()) {
      const targetFormation = formationMapByName.get(
        fileUnit.formation_name.toLowerCase()
      );
      const targetFmnId = targetFormation ? targetFormation.id : null;
      const targetFmnName = targetFormation
        ? targetFormation.formation_name
        : fileUnit.formation_name;

      const existingUnit = existingDbUnitMap.get(
        fileUnit.unit_name.toLowerCase()
      );

      if (!existingUnit) {
        // Unit does not exist in DB -> Will be created and assigned to target formation
        toCreate.push({
          unit_name: fileUnit.unit_name,
          current_formation_name: "None (New Unit)",
          target_formation_name: targetFmnName,
          fmn_id: targetFmnId,
          action: "create",
          action_label: "Create New Unit",
          rowNumber: fileUnit.row,
        });
      } else {
        const currentFmnId = existingUnit.fmn_id;
        const currentFmnName = existingUnit.formationData
          ? existingUnit.formationData.formation_name
          : "Unassigned";

        if (currentFmnId === targetFmnId) {
          unchanged.push({
            id: existingUnit.id,
            unit_name: fileUnit.unit_name,
            current_formation_name: currentFmnName,
            target_formation_name: targetFmnName,
            fmn_id: targetFmnId,
            action: "unchanged",
            action_label: "No Change",
            rowNumber: fileUnit.row,
          });
        } else {
          // Unit exists in DB, but currently has different formation (or is unassigned)
          const isUnassigned = currentFmnId === null || currentFmnId === undefined;
          const actionLabel = isUnassigned
            ? "Assign Formation"
            : "Update Formation";

          toUpdate.push({
            id: existingUnit.id,
            unit_name: fileUnit.unit_name,
            current_formation_name: currentFmnName,
            target_formation_name: targetFmnName,
            fmn_id: targetFmnId,
            action: "update",
            action_label: actionLabel,
            is_mismatch: !isUnassigned,
            rowNumber: fileUnit.row,
          });
        }
      }
    }

    // 10. If there are new units or formation updates and user hasn't confirmed yet:
    if ((toCreate.length > 0 || toUpdate.length > 0) && !isConfirmed) {
      return responseHandler(
        req,
        res,
        200,
        true,
        "",
        {
          needConfirmation: true,
          totalRows: jsonData.length,
          toCreateCount: toCreate.length,
          toUpdateCount: toUpdate.length,
          unchangedCount: unchanged.length,
          toCreate,
          toUpdate,
          unchanged,
        },
        "Formation & unit discrepancies found. Confirmation required before importing."
      );
    }

    // 11. Prepare AMK Data & FIFO Lot Allocations
    const transformedData = await transformData(jsonData);
    const validatedData = await validatedAmkQuantities(transformedData);

    if (!validatedData) {
      return responseHandler(
        req,
        res,
        400,
        false,
        "Failed to prepare AMK inventory data.",
        {},
        ""
      );
    }

    // 12. Execution inside a DB Transaction
    const transaction = await db.sequelize.transaction();
    try {
      // Create new units in ArmyUnit table
      for (const item of toCreate) {
        await db.ArmyUnit.destroy({
          where: { unit_name: item.unit_name, is_deleted: true },
          force: true,
          transaction,
        });

        await db.ArmyUnit.create(
          {
            unit_name: item.unit_name,
            fmn_id: item.fmn_id,
          },
          { transaction }
        );
      }

      // Update existing units in ArmyUnit table
      for (const item of toUpdate) {
        await db.ArmyUnit.update(
          { fmn_id: item.fmn_id },
          { where: { id: item.id }, transaction }
        );
      }

      const userId = req.headers.user_id;
      // Store LTS Driver Data using transaction
      await storeBulkDriverData(validatedData, userId, transaction);

      await transaction.commit();

      return responseHandler(
        req,
        res,
        200,
        true,
        "",
        {
          totalRows: jsonData.length,
          createdUnitsCount: toCreate.length,
          updatedUnitsCount: toUpdate.length,
          unchangedUnitsCount: unchanged.length,
        },
        "Data uploaded successfully."
      );
    } catch (txError) {
      await transaction.rollback();
      throw txError;
    }
  } catch (error) {
    return responseHandler(
      req,
      res,
      500,
      false,
      "Server error",
      { error: error.message },
      ""
    );
  }
};
