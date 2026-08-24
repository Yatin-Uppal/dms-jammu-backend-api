const db = require("../models");
const responseHandler = require("../helpers/responseHandler");
const { validationResult } = require("express-validator");
const { Op } = require("sequelize");
const xlsx = require("xlsx");
const path = require("path");
const fs = require("fs");

/**
 * Create Unit (Supports single name or comma-separated names)
 */
exports.createUnit = async (req, res) => {
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

  const { unit_name, fmn_id } = req.body;
  const targetFmnId = fmn_id ? Number(fmn_id) : null;

  try {
    // Verify formation exists if provided
    if (targetFmnId) {
      const formation = await db.formations.findOne({
        where: {
          id: targetFmnId,
          [Op.or]: [
            { is_deleted: { [Op.is]: null } },
            { is_deleted: false },
          ],
        },
      });

      if (!formation) {
        return responseHandler(
          req,
          res,
          404,
          false,
          "Specified formation does not exist or has been deleted.",
          null,
          ""
        );
      }
    }

    const unitNames = (unit_name.includes(",") ? unit_name.split(",") : [unit_name])
      .map((name) => name.trim())
      .filter((item) => item !== "");

    if (unitNames.length === 0) {
      return responseHandler(
        req,
        res,
        400,
        false,
        "Please provide at least one valid unit name.",
        null,
        ""
      );
    }

    // Check for internal duplicate unit names in the payload
    const seen = new Set();
    const internalDuplicates = [];
    for (const name of unitNames) {
      const lower = name.toLowerCase();
      if (seen.has(lower)) {
        internalDuplicates.push(name);
      }
      seen.add(lower);
    }

    if (internalDuplicates.length > 0) {
      const duplicateList = [...new Set(internalDuplicates)].map((name) => ({
        unit_name: name,
        formation_name: "Duplicate in input list",
      }));

      return responseHandler(
        req,
        res,
        400,
        false,
        "Duplicate unit name(s) entered in the form. Please make sure all entered unit names are unique.",
        { existingUnits: duplicateList },
        ""
      );
    }

    // Check for active duplicates across the entire system (regardless of formation)
    const existingUnits = await db.ArmyUnit.findAll({
      where: {
        unit_name: unitNames,
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

    if (existingUnits.length > 0) {
      const duplicateList = existingUnits.map((u) => ({
        id: u.id,
        unit_name: u.unit_name,
        fmn_id: u.fmn_id,
        formation_name: u.formationData ? u.formationData.formation_name : "Unassigned",
      }));

      return responseHandler(
        req,
        res,
        400,
        false,
        "One or more unit names already exist in the system. Existing units cannot be re-created or re-assigned through creation.",
        { existingUnits: duplicateList },
        ""
      );
    }

    // Clean up any soft-deleted records with these names before inserting to satisfy unique constraint
    await db.ArmyUnit.destroy({
      where: {
        unit_name: unitNames,
        is_deleted: true,
      },
      force: true,
    });

    // Create the new army units
    const createdUnits = await db.ArmyUnit.bulkCreate(
      unitNames.map((name) => ({
        unit_name: name,
        fmn_id: targetFmnId,
      }))
    );

    return responseHandler(
      req,
      res,
      200,
      true,
      "",
      createdUnits,
      unitNames.length > 1
        ? "Army units created successfully"
        : "Army unit created successfully"
    );
  } catch (error) {
    return responseHandler(req, res, 500, false, "Server error", { error: error.message }, "");
  }
};

/**
 * Get Paginated Units List
 */
exports.getUnitList = async (req, res) => {
  try {
    const keyword = req.query.keyword
      ? req.query.keyword.toString().trim()
      : null;
    const fmn_id = req.query.fmn_id ? +req.query.fmn_id : null;
    const limit = req.query.limit ? +req.query.limit : 10;
    const page = req.query.page ? +req.query.page : 1;
    const offset = page > 1 ? (page - 1) * limit : 0;

    const whereClause = {
      ...(keyword && {
        unit_name: { [Op.like]: `%${keyword}%` },
      }),
      ...(fmn_id && { fmn_id }),
      [Op.or]: [
        { is_deleted: { [Op.is]: null } },
        { is_deleted: false },
      ],
    };

    const unitList = await db.ArmyUnit.findAll({
      where: whereClause,
      include: [
        {
          model: db.formations,
          as: "formationData",
          attributes: ["id", "formation_name"],
        },
      ],
      offset,
      limit,
      order: [["created_at", "DESC"]],
    });

    const totalCount = await db.ArmyUnit.count({ where: whereClause });
    const totalPage = Math.ceil(totalCount / limit);

    return responseHandler(
      req,
      res,
      200,
      true,
      "",
      { unitList, page, limit, totalCount, totalPage },
      "Army unit list fetched successfully"
    );
  } catch (error) {
    return responseHandler(req, res, 500, false, "Server error", { error: error.message }, "");
  }
};

/**
 * Get Complete Units List (for dropdowns / selection)
 */
exports.getUnitCompleteList = async (req, res) => {
  try {
    const fmn_id = req.query.fmn_id ? +req.query.fmn_id : null;
    const unassignedOnly = req.query.unassigned === "true";
    const unassignedOrFmnId = req.query.unassigned_or_fmn_id
      ? +req.query.unassigned_or_fmn_id
      : null;

    let fmnCondition = null;
    if (unassignedOrFmnId) {
      fmnCondition = {
        [Op.or]: [
          { fmn_id: { [Op.is]: null } },
          { fmn_id: unassignedOrFmnId },
        ],
      };
    } else if (unassignedOnly) {
      fmnCondition = {
        fmn_id: { [Op.is]: null },
      };
    } else if (fmn_id) {
      fmnCondition = { fmn_id };
    }

    const whereClause = {
      ...(fmnCondition && fmnCondition),
      [Op.or]: [
        { is_deleted: { [Op.is]: null } },
        { is_deleted: false },
      ],
    };

    const unitList = await db.ArmyUnit.findAll({
      where: whereClause,
      include: [
        {
          model: db.formations,
          as: "formationData",
          attributes: ["id", "formation_name"],
        },
      ],
      order: [["unit_name", "ASC"]],
    });

    return responseHandler(
      req,
      res,
      200,
      true,
      "",
      { unitList },
      "Army units complete list fetched successfully"
    );
  } catch (error) {
    return responseHandler(req, res, 500, false, "Server error", { error: error.message }, "");
  }
};

/**
 * Update Unit
 */
exports.updateUnit = async (req, res) => {
  try {
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

    const { unit_id } = req.params;
    const { unit_name, fmn_id } = req.body;

    const unit = await db.ArmyUnit.findByPk(unit_id);
    if (!unit) {
      return responseHandler(
        req,
        res,
        404,
        false,
        "Unit not found with this id",
        {}
      );
    }

    const targetFmnId = req.body.hasOwnProperty("fmn_id")
      ? (fmn_id ? Number(fmn_id) : null)
      : unit.fmn_id;
    const targetUnitName = unit_name ? unit_name.trim() : unit.unit_name;

    // Check duplicate globally across all units
    const existing = await db.ArmyUnit.findOne({
      where: {
        unit_name: targetUnitName,
        id: { [Op.ne]: unit_id },
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

    if (existing) {
      const currentFormation = existing.formationData
        ? existing.formationData.formation_name
        : "Unassigned";
      return responseHandler(
        req,
        res,
        400,
        false,
        `Unit name '${targetUnitName}' already exists in the system (assigned to ${currentFormation}). Please use a different Unit name.`,
        {
          existingUnits: [
            {
              id: existing.id,
              unit_name: existing.unit_name,
              fmn_id: existing.fmn_id,
              formation_name: currentFormation,
            },
          ],
        },
        ""
      );
    }

    // Verify target formation if provided
    if (targetFmnId) {
      const formation = await db.formations.findOne({
        where: {
          id: targetFmnId,
          [Op.or]: [
            { is_deleted: { [Op.is]: null } },
            { is_deleted: false },
          ],
        },
      });

      if (!formation) {
        return responseHandler(
          req,
          res,
          404,
          false,
          "Target formation does not exist.",
          {}
        );
      }
    }

    await db.ArmyUnit.update(
      {
        unit_name: targetUnitName,
        fmn_id: targetFmnId,
      },
      {
        where: { id: unit_id },
      }
    );

    return responseHandler(
      req,
      res,
      200,
      true,
      "",
      null,
      "Unit details updated successfully."
    );
  } catch (error) {
    return responseHandler(req, res, 500, false, "Server error", { error: error.message }, "");
  }
};

/**
 * Delete Unit (Soft Delete)
 */
exports.deleteUnit = async (req, res) => {
  try {
    const { unit_id } = req.params;

    const unit = await db.ArmyUnit.findOne({
      where: { id: unit_id },
    });

    if (!unit) {
      return responseHandler(
        req,
        res,
        404,
        false,
        "Unit does not exist with this id",
        {}
      );
    }

    await db.ArmyUnit.destroy({
      where: { id: unit_id },
    });

    return responseHandler(
      req,
      res,
      200,
      true,
      "",
      null,
      "Unit deleted successfully."
    );
  } catch (error) {
    return responseHandler(req, res, 500, false, "Server error", { error: error.message }, "");
  }
};

/**
 * Bulk Upload Units from Excel
 */
exports.bulkUploadUnits = async (req, res) => {
  try {
    if (!req.file) {
      return responseHandler(
        req,
        res,
        400,
        false,
        "No Excel file uploaded. Please select a file.",
        {},
        "Missing file"
      );
    }

    if (req.file.size === 0) {
      if (req.file.path && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return responseHandler(
        req,
        res,
        400,
        false,
        "Empty file uploaded. Please select a valid Excel file.",
        {},
        "Empty file"
      );
    }

    const isConfirmed =
      req.query.confirm === "true" ||
      req.body.confirm === "true" ||
      req.body.confirm === true;

    // Check extension
    const ext = path.extname(req.file.originalname).toLowerCase();
    if (ext !== ".xlsx" && ext !== ".xls") {
      return responseHandler(
        req,
        res,
        400,
        false,
        "Invalid file format. Please upload .xlsx or .xls files only.",
        {},
        "Invalid format"
      );
    }

    let workbook;
    if (req.file.buffer) {
      workbook = xlsx.read(req.file.buffer, { type: "buffer" });
    } else if (req.file.path) {
      workbook = xlsx.readFile(req.file.path);
    }

    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const jsonData = xlsx.utils.sheet_to_json(sheet);

    // Clean up uploaded temp file if stored on disk
    if (req.file.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    if (!jsonData || jsonData.length === 0) {
      return responseHandler(
        req,
        res,
        400,
        false,
        "Excel sheet is empty or contains no data rows.",
        {},
        "Empty sheet"
      );
    }

    // Fetch all active formations for lookup
    const allFormations = await db.formations.findAll({
      where: {
        [Op.or]: [
          { is_deleted: { [Op.is]: null } },
          { is_deleted: false },
        ],
      },
    });

    const formationMapByName = {};
    const formationMapById = {};
    allFormations.forEach((f) => {
      formationMapByName[f.formation_name.toLowerCase().trim()] = f.id;
      formationMapById[f.id] = f.formation_name;
    });

    const invalidFormations = [];
    const missingUnitNames = [];
    const internalDuplicateUnits = [];
    const seenUnits = new Map();
    const parsedRows = [];

    for (let index = 0; index < jsonData.length; index++) {
      const row = jsonData[index];
      const rowNumber = index + 2; // Row 1 is header

      const rawUnitName =
        row["Unit Name"] ||
        row["unit_name"] ||
        row["Unit"] ||
        row["unit"] ||
        row["Army Unit"] ||
        row["army_unit"];
      const rawFormation =
        row["Formation Name"] ||
        row["formation_name"] ||
        row["Formation"] ||
        row["formation"] ||
        row["Formation ID"] ||
        row["fmn_id"] ||
        row["fmnId"];

      const unitName = rawUnitName ? String(rawUnitName).trim() : "";
      if (!unitName) {
        missingUnitNames.push({
          row: rowNumber,
          error: "Missing or empty Unit Name",
          data: row,
        });
        continue;
      }

      // Check intra-file duplicate unit names
      const unitKey = unitName.toLowerCase();
      if (seenUnits.has(unitKey)) {
        internalDuplicateUnits.push({
          row: rowNumber,
          firstOccurrenceRow: seenUnits.get(unitKey),
          unit_name: unitName,
          error: `Unit '${unitName}' appears multiple times in the Excel sheet (first seen at row ${seenUnits.get(unitKey)}).`,
        });
      } else {
        seenUnits.set(unitKey, rowNumber);
      }

      let resolvedFmnId = null;
      let targetFmnName = "Unassigned";
      let isNewFormation = false;

      if (rawFormation !== undefined && rawFormation !== null && String(rawFormation).trim() !== "") {
        const formationStr = String(rawFormation).trim();
        const lookupKey = formationStr.toLowerCase();

        if (typeof rawFormation === "number" && formationMapById[rawFormation]) {
          resolvedFmnId = rawFormation;
          targetFmnName = formationMapById[rawFormation];
        } else if (formationMapByName[lookupKey]) {
          resolvedFmnId = formationMapByName[lookupKey];
          targetFmnName = formationMapById[resolvedFmnId];
        } else if (!isNaN(Number(formationStr)) && formationMapById[Number(formationStr)]) {
          resolvedFmnId = Number(formationStr);
          targetFmnName = formationMapById[resolvedFmnId];
        } else {
          // Non-existing formation: mark as new formation to create
          isNewFormation = true;
          targetFmnName = formationStr;
        }
      }

      parsedRows.push({
        rowNumber,
        unit_name: unitName,
        fmn_id: resolvedFmnId,
        target_formation_name: targetFmnName,
        is_new_formation: isNewFormation,
      });
    }

    // 1. Missing unit names or intra-file duplicates error
    if (missingUnitNames.length > 0) {
      return responseHandler(
        req,
        res,
        400,
        false,
        "One or more rows have missing or empty Unit names. Please fix the Excel file.",
        {
          errorType: "MISSING_UNIT_NAMES",
          totalRows: jsonData.length,
          missingUnitNames,
        },
        "Missing unit names"
      );
    }

    if (internalDuplicateUnits.length > 0) {
      return responseHandler(
        req,
        res,
        400,
        false,
        "Duplicate Unit names found in the Excel sheet. Each unit name must appear only once.",
        {
          errorType: "DUPLICATE_UNITS_IN_EXCEL",
          totalRows: jsonData.length,
          internalDuplicateUnits,
        },
        "Duplicate unit names in file"
      );
    }

    if (parsedRows.length === 0) {
      return responseHandler(
        req,
        res,
        400,
        false,
        "No valid rows to process from the Excel file.",
        { totalRows: jsonData.length },
        "Validation failed"
      );
    }

    // Identify unique formations to create
    const formationsToCreateMap = new Map();
    for (const row of parsedRows) {
      if (row.is_new_formation && row.target_formation_name && row.target_formation_name !== "Unassigned") {
        const fmnKey = row.target_formation_name.toLowerCase().trim();
        if (!formationsToCreateMap.has(fmnKey)) {
          formationsToCreateMap.set(fmnKey, {
            formation_name: row.target_formation_name,
            rowNumber: row.rowNumber,
            action: "create_formation",
            action_label: "Create Formation",
          });
        }
      }
    }
    const formationsToCreate = Array.from(formationsToCreateMap.values());

    // Lookup existing active units in database
    const allUnitNames = parsedRows.map((r) => r.unit_name);
    const existingDbUnits = await db.ArmyUnit.findAll({
      where: {
        unit_name: allUnitNames,
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

    const existingUnitMap = new Map();
    existingDbUnits.forEach((u) => {
      existingUnitMap.set(u.unit_name.toLowerCase().trim(), u);
    });

    const toCreate = [];
    const toUpdate = [];
    const unchanged = [];
    const diffList = [];

    for (const row of parsedRows) {
      const existing = existingUnitMap.get(row.unit_name.toLowerCase().trim());
      if (!existing) {
        const item = {
          unit_name: row.unit_name,
          current_formation_name: "None (New Unit)",
          target_formation_name: row.target_formation_name,
          fmn_id: row.fmn_id,
          is_new_formation: row.is_new_formation,
          action: "create",
          action_label: row.is_new_formation ? "Create Unit & Formation" : "Create New Unit",
          rowNumber: row.rowNumber,
        };
        toCreate.push(item);
        diffList.push(item);
      } else {
        const currentFmnId = existing.fmn_id;
        const currentFmnName = existing.formationData
          ? existing.formationData.formation_name
          : "Unassigned";

        if (row.fmn_id && currentFmnId === row.fmn_id) {
          const item = {
            id: existing.id,
            unit_name: row.unit_name,
            current_formation_name: currentFmnName,
            target_formation_name: row.target_formation_name,
            fmn_id: row.fmn_id,
            action: "unchanged",
            action_label: "No Change",
            rowNumber: row.rowNumber,
          };
          unchanged.push(item);
          diffList.push(item);
        } else {
          let actionLabel =
            row.fmn_id === null && !row.is_new_formation
              ? "Unassign Formation"
              : "Update Formation";
          if (row.is_new_formation) {
            actionLabel = "Update to New Formation";
          }
          const item = {
            id: existing.id,
            unit_name: row.unit_name,
            current_formation_name: currentFmnName,
            target_formation_name: row.target_formation_name,
            fmn_id: row.fmn_id,
            is_new_formation: row.is_new_formation,
            action: "update",
            action_label: actionLabel,
            rowNumber: row.rowNumber,
          };
          toUpdate.push(item);
          diffList.push(item);
        }
      }
    }

    // If there are new formations or existing units whose formation will be changed, and user hasn't confirmed yet:
    if ((formationsToCreate.length > 0 || toUpdate.length > 0 || toCreate.length > 0) && !isConfirmed) {
      return responseHandler(
        req,
        res,
        200,
        true,
        "",
        {
          needConfirmation: true,
          totalRows: jsonData.length,
          formationsToCreateCount: formationsToCreate.length,
          formationsToCreate,
          toCreateCount: toCreate.length,
          toUpdateCount: toUpdate.length,
          unchangedCount: unchanged.length,
          toCreate,
          toUpdate,
          unchanged,
        },
        "Formation and unit changes found. Confirmation required before importing."
      );
    }

    // Execute Import with Database Transaction
    const transaction = await db.sequelize.transaction();
    try {
      // 1. Create or reactivate missing formations
      const resolvedFormationMap = { ...formationMapByName };
      for (const fmn of formationsToCreate) {
        const existingDeletedFmn = await db.formations.findOne({
          where: {
            formation_name: fmn.formation_name,
            is_deleted: true,
          },
          transaction,
        });

        let fmnInstance;
        if (existingDeletedFmn) {
          await db.formations.update(
            { is_deleted: false },
            { where: { id: existingDeletedFmn.id }, transaction }
          );
          fmnInstance = existingDeletedFmn;
        } else {
          fmnInstance = await db.formations.create(
            { formation_name: fmn.formation_name },
            { transaction }
          );
        }

        resolvedFormationMap[fmn.formation_name.toLowerCase().trim()] = fmnInstance.id;
      }

      // 2. Create new units
      for (const item of toCreate) {
        let effectiveFmnId = item.fmn_id;
        if (!effectiveFmnId && item.target_formation_name && item.target_formation_name !== "Unassigned") {
          const resolvedId = resolvedFormationMap[item.target_formation_name.toLowerCase().trim()];
          if (resolvedId) {
            effectiveFmnId = resolvedId;
          }
        }

        await db.ArmyUnit.destroy({
          where: { unit_name: item.unit_name, is_deleted: true },
          force: true,
          transaction,
        });

        await db.ArmyUnit.create(
          {
            unit_name: item.unit_name,
            fmn_id: effectiveFmnId,
          },
          { transaction }
        );
      }

      // 3. Update existing units' formations
      for (const item of toUpdate) {
        let effectiveFmnId = item.fmn_id;
        if (!effectiveFmnId && item.target_formation_name && item.target_formation_name !== "Unassigned") {
          const resolvedId = resolvedFormationMap[item.target_formation_name.toLowerCase().trim()];
          if (resolvedId) {
            effectiveFmnId = resolvedId;
          }
        }

        await db.ArmyUnit.update(
          { fmn_id: effectiveFmnId },
          { where: { id: item.id }, transaction }
        );
      }

      await transaction.commit();

      return responseHandler(
        req,
        res,
        200,
        true,
        "",
        {
          needConfirmation: false,
          totalRows: jsonData.length,
          createdFormationsCount: formationsToCreate.length,
          insertedCount: toCreate.length,
          updatedCount: toUpdate.length,
          unchangedCount: unchanged.length,
        },
        `Army units processed successfully.${
          formationsToCreate.length > 0 ? ` ${formationsToCreate.length} formation(s) created.` : ""
        }${
          toCreate.length > 0 ? ` ${toCreate.length} created.` : ""
        }${toUpdate.length > 0 ? ` ${toUpdate.length} updated.` : ""}`
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
