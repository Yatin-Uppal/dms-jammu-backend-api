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
  const { formation_name } = req.body;
  try {
    if (formation_name.includes(",")) {
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

      const existingFormation = await db.formations.findOne({
        where: {
          formation_name: singleFormationName,
        },
      });
      // Insert singleFormationName into your database using Sequelize
      if (!existingFormation) {
        // Insert singleFormationName into your database using Sequelize
        const createdFormation = await db.formations.create({
          formation_name: singleFormationName,
        });

        // Respond with success or appropriate response
        return responseHandler(
          req,
          res,
          200,
          true,
          "",
          createdFormation,
          "Formation created successfully"
        );
      } else {
        const updatedFormation = await db.formations.update(
          {
            is_deleted: false,
          },
          {
            where: {
              id: existingFormation.id,
            },
          }
        );
        return responseHandler(
          req,
          res,
          200,
          true,
          "",
          updatedFormation,
          "Formation created successfully"
        );
      }
    }
  } catch (error) {
    responseHandler(req, res, 500, false, "Server error", { error }, "");
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
      offset,
      limit,
      order: [["created_at", "DESC"]],
    });
    totalCount = await db.formations.count({ where: { ...whereClause } });
    const totalPage = parseInt(totalCount / limit) + 1;
    responseHandler(
      req,
      res,
      200,
      true,
      "",
      { formationList, page, limit, totalCount, totalPage },
      "Formation list fecthed successfully"
    );
  } catch (error) {
    responseHandler(req, res, 500, false, "Server error", { error }, "");
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
      order: [["created_at", "DESC"]],
    });
    responseHandler(
      req,
      res,
      200,
      true,
      "",
      { formationList },
      "Formation list fecthed successfully"
    );
  } catch (error) {
    responseHandler(req, res, 500, false, "Server error", { error }, "");
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
    const { formation_name } = req.body;
    const existing = await db.formations.findOne({
      where: {
        formation_name: formation_name,
        id: { [Op.ne]: formation_id },
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
    await db.formations.update(
      {
        formation_name: formation_name ? formation_name : null,
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
    await db.formations.update(
      {
        is_deleted: true,
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
    responseHandler(req, res, 500, false, "Server error", { error }, "");
  }
};
