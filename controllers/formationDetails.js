const db = require("../models");
const responseHandler = require("../helpers/responseHandler");
const { validationResult } = require("express-validator");
const { Op } = require("sequelize");
exports.createFormation = async (req, res) => {
  // validations
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
  const { formation_name, unit_ids } = req.body;
  try {
    if (formation_name.includes(",")) {
      if (unit_ids && Array.isArray(unit_ids) && unit_ids.length > 0) {
        return responseHandler(
          req,
          res,
          400,
          false,
          "Army units can only be assigned when creating a single formation.",
          null,
          ""
        );
      }

      let allFormations = formation_name
        .split(",")
        .filter((item) => item !== "");
      const formationNames = allFormations.map((name) => name.trim());

      // Check for existing formations
      const existingFormations = await db.formations.findAll({
        where: {
          formation_name: formationNames,
          is_deleted: true,
        },
      });
      const duplicatFormation = await db.formations.findAll({
        where: {
          formation_name: formationNames,
          [db.Sequelize.Op.or]: [
            { is_deleted: { [db.Sequelize.Op.is]: null } }, // Exclude null values
            { is_deleted: { [db.Sequelize.Op.is]: false } }, // Exclude false values
          ],
        },
      });
      if (duplicatFormation.length > 0) {
        return responseHandler(
          req,
          res,
          400,
          false,
          "Formation names already exists. Please use a different Formation name.",
          duplicatFormation,
          ""
        );
      }
      
      // Update existing formations with is_deleted false
      if (existingFormations.length > 0) {
        await db.formations.update(
          { is_deleted: false },
          {
            where: {
              formation_name: formationNames,
              is_deleted: true,
            },
          }
        );
      }

      // Insert newFormationNames into your database using Sequelize
      const createdFormations = await db.formations.bulkCreate(
        formationNames.map((name) => ({ formation_name: name })),
        { ignoreDuplicates: true }
      );

      // Respond with success or appropriate response
      return responseHandler(
        req,
        res,
        200,
        true,
        "",
        createdFormations,
        "Formations created successfully"
      );
    } else {
      // Insert a single record if there is no comma in formation_name
      const singleFormationName = formation_name.trim();
      const duplicatFormation = await db.formations.findOne({
        where: {
          formation_name: singleFormationName,
          [db.Sequelize.Op.or]: [
            { is_deleted: { [db.Sequelize.Op.is]: null } }, // Exclude null values
            { is_deleted: { [db.Sequelize.Op.is]: false } }, // Exclude false values
          ],
        },
      });
      if (duplicatFormation) {
        return responseHandler(
          req,
          res,
          400,
          false,
          "Formation name already exists. Please use a different Formation name.",
          duplicatFormation,
          ""
        );
      }

      // If unit_ids provided, validate them before creating/updating formation
      let unitsToAssign = [];
      if (unit_ids && Array.isArray(unit_ids) && unit_ids.length > 0) {
        unitsToAssign = await db.ArmyUnit.findAll({
          where: {
            id: unit_ids,
            [Op.or]: [
              { is_deleted: { [Op.is]: null } },
              { is_deleted: false },
            ],
          },
        });

        if (unitsToAssign.length !== unit_ids.length) {
          return responseHandler(
            req,
            res,
            400,
            false,
            "One or more selected Army Units do not exist or are deleted.",
            null,
            ""
          );
        }

        // Check if any unit is already assigned to a formation
        const alreadyAssigned = unitsToAssign.filter((u) => u.fmn_id !== null);
        if (alreadyAssigned.length > 0) {
          return responseHandler(
            req,
            res,
            400,
            false,
            `Unit '${alreadyAssigned[0].unit_name}' is already assigned to another formation. Only unassigned units can be selected.`,
            null,
            ""
          );
        }

        // Check duplicate unit names among selected units
        const unitNameSet = new Set();
        for (const unit of unitsToAssign) {
          const lowerName = unit.unit_name.toLowerCase().trim();
          if (unitNameSet.has(lowerName)) {
            return responseHandler(
              req,
              res,
              400,
              false,
              `Duplicate unit name '${unit.unit_name}' found in selected units. A formation cannot have multiple units with the same name.`,
              null,
              ""
            );
          }
          unitNameSet.add(lowerName);
        }
      }

      const existingFormation = await db.formations.findOne({
        where: {
          formation_name: singleFormationName,
          is_deleted: true
        },
      });

      let formationId;
      let resultData;

      if (!existingFormation) {
        // Insert singleFormationName into database using Sequelize
        const createdFormation = await db.formations.create({
          formation_name: singleFormationName,
        });
        formationId = createdFormation.id;
        resultData = createdFormation;
      } else {
        await db.formations.update(
          {
            is_deleted: false,
          },
          {
            where: {
              id: existingFormation.id,
            },
          }
        );
        formationId = existingFormation.id;
        resultData = await db.formations.findByPk(existingFormation.id);
      }

      // Check collision with any existing active units in this target formation not in unit_ids
      if (unitsToAssign.length > 0) {
        const existingInFormation = await db.ArmyUnit.findAll({
          where: {
            fmn_id: formationId,
            id: { [Op.notIn]: unit_ids },
            [Op.or]: [
              { is_deleted: { [Op.is]: null } },
              { is_deleted: false },
            ],
          },
        });

        const existingNames = new Set(
          existingInFormation.map((u) => u.unit_name.toLowerCase().trim())
        );

        for (const unit of unitsToAssign) {
          if (existingNames.has(unit.unit_name.toLowerCase().trim())) {
            return responseHandler(
              req,
              res,
              400,
              false,
              `A unit named '${unit.unit_name}' already exists in this formation.`,
              null,
              ""
            );
          }
        }

        // Assign selected units to this formation
        await db.ArmyUnit.update(
          { fmn_id: formationId },
          { where: { id: unit_ids } }
        );
      }

      return responseHandler(
        req,
        res,
        200,
        true,
        "",
        resultData,
        "Formation created successfully"
      );
    }
  } catch (error) {
    console.log(error)
    responseHandler(req, res, 500, false, "Server error", { error: error.message || error }, "");
  }
};

exports.getFormationList = async (req, res) => {
  try {
    const keyword = req.query.keyword
      ? req.query.keyword.toString().trim()
      : null;
    const limit = req.query.limit ? +req.query.limit : 10;
    const page = req.query.page ? +req.query.page : 1;
    const offset = page > 1 ? (page - 1) * limit : 0;
    const whereClause = {
      ...(keyword && {
        formation_name: { [Op.like]: `%${keyword}%` },
      }),
      [db.Sequelize.Op.or]: [
        { is_deleted: { [db.Sequelize.Op.is]: null } }, // Exclude null values
        { is_deleted: { [db.Sequelize.Op.is]: false } }, // Exclude false values
      ],
    };
    let formationList = await db.formations.findAll({
      where: { ...whereClause },
      include: [
        {
          model: db.ArmyUnit,
          as: "units",
          attributes: ["id", "unit_name", "fmn_id"],
          required: false,
          where: {
            [Op.or]: [
              { is_deleted: { [Op.is]: null } },
              { is_deleted: false },
            ],
          },
        },
      ],
      distinct: true,
      offset,
      limit,
      order: [["created_at", "DESC"]],
    });
    const totalCount = await db.formations.count({ where: { ...whereClause } });
    const totalPage = Math.ceil(totalCount / limit);
    responseHandler(
      req,
      res,
      200,
      true,
      "",
      { formationList, page, limit, totalCount, totalPage },
      "Formation list fetched successfully"
    );
  } catch (error) {
    responseHandler(req, res, 500, false, "Server error", { error: error.message || error }, "");
  }
};

exports.getFormationCompleteList = async (req, res) => {
  try {
    const whereClause = {
      [db.Sequelize.Op.or]: [
        { is_deleted: { [db.Sequelize.Op.is]: null } }, // Exclude null values
        { is_deleted: { [db.Sequelize.Op.is]: false } }, // Exclude false values
      ],
    };
    let formationList = await db.formations.findAll({
      where: { ...whereClause },
      include: [
        {
          model: db.ArmyUnit,
          as: "units",
          attributes: ["id", "unit_name", "fmn_id"],
          required: false,
          where: {
            [Op.or]: [
              { is_deleted: { [Op.is]: null } },
              { is_deleted: false },
            ],
          },
        },
      ],
      distinct: true,
      order: [["created_at", "DESC"]],
    });
    responseHandler(
      req,
      res,
      200,
      true,
      "",
      { formationList },
      "Formation list fetched successfully"
    );
  } catch (error) {
    responseHandler(req, res, 500, false, "Server error", { error: error.message || error }, "");
  }
};

exports.updateForomation = async (req, res) => {
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
    const { formation_id } = req.params;
    const { formation_name, unit_ids } = req.body;
    const existing = await db.formations.findOne({
      where: {
        formation_name: formation_name,
        id: { [Op.ne]: formation_id },
        [Op.or]: [
          { is_deleted: { [Op.is]: null } },
          { is_deleted: false },
        ],
      },
    });
    if (existing) {
      return responseHandler(
        req,
        res,
        403,
        false,
        "Formation name already exists. Please use a different Formation name.",
        {}
      );
    }

    const currentFormation = await db.formations.findOne({
      where: {
        id: formation_id,
        [Op.or]: [
          { is_deleted: { [Op.is]: null } },
          { is_deleted: false },
        ],
      },
    });

    if (!currentFormation) {
      return responseHandler(
        req,
        res,
        404,
        false,
        "Formation not found with this id",
        {}
      );
    }

    // If unit_ids provided as an array, synchronize units for this formation
    if (unit_ids && Array.isArray(unit_ids)) {
      if (unit_ids.length > 0) {
        const unitsToAssign = await db.ArmyUnit.findAll({
          where: {
            id: unit_ids,
            [Op.or]: [
              { is_deleted: { [Op.is]: null } },
              { is_deleted: false },
            ],
          },
        });

        if (unitsToAssign.length !== unit_ids.length) {
          return responseHandler(
            req,
            res,
            400,
            false,
            "One or more selected Army Units do not exist or are deleted.",
            null,
            ""
          );
        }

        // Check if any unit is already assigned to another formation
        const foreignAssigned = unitsToAssign.filter(
          (u) => u.fmn_id && u.fmn_id !== Number(formation_id)
        );
        if (foreignAssigned.length > 0) {
          return responseHandler(
            req,
            res,
            400,
            false,
            `Unit '${foreignAssigned[0].unit_name}' is already assigned to another formation. Only unassigned units can be selected.`,
            null,
            ""
          );
        }

        // Check duplicate unit names among selected units
        const unitNameSet = new Set();
        for (const unit of unitsToAssign) {
          const lowerName = unit.unit_name.toLowerCase().trim();
          if (unitNameSet.has(lowerName)) {
            return responseHandler(
              req,
              res,
              400,
              false,
              `Duplicate unit name '${unit.unit_name}' found in selected units. A formation cannot have multiple units with the same name.`,
              null,
              ""
            );
          }
          unitNameSet.add(lowerName);
        }

        // Unassign units that were previously assigned to this formation but removed in this update
        await db.ArmyUnit.update(
          { fmn_id: null },
          {
            where: {
              fmn_id: formation_id,
              id: { [Op.notIn]: unit_ids },
            },
          }
        );

        // Assign selected units to this formation
        await db.ArmyUnit.update(
          { fmn_id: formation_id },
          { where: { id: unit_ids } }
        );
      } else {
        // unit_ids is empty array: unassign all units from this formation
        await db.ArmyUnit.update(
          { fmn_id: null },
          { where: { fmn_id: formation_id } }
        );
      }
    }

    await db.formations.update(
      {
        formation_name: formation_name ? formation_name.trim() : null,
      },
      {
        where: {
          id: formation_id,
        },
      }
    );
    responseHandler(
      req,
      res,
      200,
      true,
      "",
      null,
      "Formation details updated successfully."
    );
  } catch (error) {
    responseHandler(req, res, 500, false, "Server error", { error }, "");
  }
};

exports.deleteFormation = async (req, res) => {
  try {
    let formation = await db.formations.findOne({
      where: {
        id: req.params.formation_id,
      },
    });
    if (!formation) {
      return responseHandler(
        req,
        res,
        400,
        false,
        " Formation does not exist with this id",
        {}
      );
    }
    let driverVehicleId = await db.DriverVehicleDetail.findOne({
      where: {
        fmn_id: req.params.formation_id,
      },
      attributes: ["id"],
    });
    if (driverVehicleId) {
      // Now that you have driverVehicleId.id, you can use it to find the AssignedLtsDetail
      const assignedLtsDetail = await db.AssignedLtsDetail.findOne({
        where: {
          id: driverVehicleId.id,
          is_deleted: {
            [Op.or]: [null, false],
          },
        },
      });
      if (driverVehicleId) {
        return responseHandler(
          req,
          res,
          403,
          true,
          "Assigned Formation can't be deleted ",
          null,
          "."
        );
      }
    }
    // Unassign all units assigned to this formation
    await db.ArmyUnit.update(
      { fmn_id: null },
      { where: { fmn_id: req.params.formation_id } }
    );

    await db.formations.update(
      {
        is_deleted: true,
         deleted_at: Date.now(),
      },
      {
         
        where: {
          id: req.params.formation_id,
        },
      }
    );
    responseHandler(
      req,
      res,
      200,
      true,
      "",
      null,
      "Formation deleted successfully."
    );
  } catch (error) {
    console.log(error)
    responseHandler(req, res, 500, false, "Server error", { error }, "");
  }
};
