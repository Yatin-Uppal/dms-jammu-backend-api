// controllers/ltsDetailsController.js

const db = require("../models");
const responseHandler = require("../helpers/responseHandler");
const { validationResult } = require("express-validator");
const { Sequelize, Op } = require("sequelize");
const {
  getSktData,
  getSktDataWithVarieties,
} = require("../services/ltsServices");

// get lts data with count : mainly used for pagination and list view
exports.getLTSDetails = async (req, res) => {
  try {
    const keyword = req.query.keyword ? req.query.keyword.toString() : null;
    const type = req.query.type ? req.query.type.toString() : null;

    const page = req.query.page ? +req.query.page : 1;
    const limit = req.query.limit ? +req.query.limit : 10;
    const offset = page > 1 ? (page - 1) * limit : 0;

    const whereClause = {
      ...(keyword && {
        name: { [Op.like]: `%${keyword}%` },
      }),
      ...(type && {
        type: type,
      }),
      [db.Sequelize.Op.or]: [
        { is_deleted: { [db.Sequelize.Op.is]: null } }, // Exclude null values
        { is_deleted: { [db.Sequelize.Op.is]: false } }, // Exclude false values
      ],
    };

    let ltsDetails = await db.LtsDetail.findAll({
      attributes: ["id", "name", "lts_date_and_time", "type", "fmn_id"],
      include: [
        {
          model: db.formations,
          as: "formationData",
          attributes: ["formation_name"],
        },
        {
          model: db.User,
          as: "updatedBy",
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
          as: "createdBy",
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
      where: { ...whereClause },
      group: ["LtsDetail.id"],
      subQuery: false,
      offset,
      limit,
      order: [["created_at", "DESC"]],
    });
    totalCount = await db.LtsDetail.count({ where: { ...whereClause } });
    const totalPage = parseInt(totalCount / limit) + 1;
    responseHandler(req,
      res,
      200,
      true,
      "",
      { ltsDetails, page, limit, totalCount, totalPage },
      "LTS details fetched successfully."
    );
  } catch (error) {
    responseHandler(req,res, 500, false, "Server error", { error }, "");
  }
};

// to create the lts
exports.createLTS = async (req, res) => {
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

    // Check if load_telly_sheet_lts_number (case insensitive) already exists
    const existingLts = await db.LtsDetail.findOne({
      where: db.sequelize.where(
        db.sequelize.fn("LOWER", db.sequelize.col("name")),
        db.sequelize.fn("LOWER", req.body.ltsNo)
      ),
    });

    if (existingLts) {
      return responseHandler(req,
        res,
        403,
        false,
        "This LTS name already exists. Please use a different LTS name.",
        {}
      );
    }
    const { ltsNo, type, fmn_id, skts, user_id } = req.body;
    // Create the LTS record
    const newLts = await db.LtsDetail.create({
      name: ltsNo,
      lts_date_and_time: new Date(),
      type: type,
      fmn_id: fmn_id,
      created_by: user_id,
    });

    const sktData = [];
    let newVariety;
    for (const skt of skts) {
      const newSkt = await db.SktDetails.create({
        name: skt.skt_name,
        lts_issue_voucher_detail_id: newLts.id,
      });

      for (const variety of skt.varieties) {
        newVariety = await db.VarietyDetail.create({
          amk_number: variety.amk_number || null,
          nomenclature: variety.nomenclature || null,
          ipq: variety.ipq || null,
          package_weight: variety.package_weight || null,
          qty: variety.qty || null,
          number_of_package: variety.number_of_package || null,
          location_33_fad: variety.location_33_fad || null,
          fad_loading_point_lp_number:
            variety.fad_loading_point_lp_number || null,
        });

        await db.SktVarieties.create({
          skt_id: newSkt.id,
          variety_id: newVariety.id,
        });
      }

      sktData.push(newSkt);
    }

    const ltsData = {
      id: newLts.id,
      lts_name: newLts.name,
      skts: sktData,
    };

    responseHandler(req,
      res,
      200,
      true,
      "",
      { ...ltsData },
      "LTS created successfully"
    );
  } catch (error) {
    responseHandler(req,res, 500, false, "Server error", { error });
  }
};

// to get lts data by id
exports.getLTSDetailsById = async (req, res) => {
  try {
    const lts = await db.LtsDetail.findOne({
      where: {
        id: req.params.ltsId,
      },
      include: [
        {
          model: db.formations,
          as: "formationData",
          attributes: ["id", "formation_name"],
          
        },
        {
          model: db.User,
          as: "updatedBy",
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
          as: "createdBy",
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

    if (!lts) {
      return responseHandler(req,
        res,
        400,
        false,
        " LTS does not exist with this id",
        {}
      );
    }

    // Check if LTS is assigned
    const checkAssigned = await db.AssignedLtsDetail.findOne({
      where: {
        lts_issue_voucher_detail_id: req.params.ltsId,
        [db.Sequelize.Op.or]: [
          { is_deleted: { [db.Sequelize.Op.is]: null } },
          { is_deleted: { [db.Sequelize.Op.is]: false } },
        ],
      },
    });

    const isLTSAssigned = !!checkAssigned;

    const sktData = await getSktData(lts.id);
    // Initialize an array to store the transformed skt data
    const sktDataWithVarieties = await getSktDataWithVarieties(sktData);

    // Transform the data into the desired format
    const ltsData = {
      ltsId: lts.id,
      ltsNo: lts.name,
      type: lts.type,
      lts_date_and_time: lts.lts_date_and_time,
      formation_name: lts?.formationData?.formation_name,
      fmn_id: lts.formationData.id,
      skts: sktDataWithVarieties,
      created_by: lts.createdBy,
      updated_by: lts.updatedBy,
      isLTSAssigned,
    };
    responseHandler(req,res, 200, true, "", ltsData);
  } catch (error) {
    responseHandler(req,res, 500, false, "Server error", { error });
    console.log(error);
  }
};

// to delete lts data
exports.deleteLTS = async (req, res) => {
  try {
    // Check if LTS exists
    let lts = await db.LtsDetail.findOne({
      where: {
        id: req.params.ltsId,
      },
    });
    if (!lts) {
      return responseHandler(req,
        res,
        400,
        false,
        "LTS does not exist with this id",
        {}
      );
    }

    // Check if LTS is assigned
    let checkAssigned = await db.AssignedLtsDetail.findOne({
      where: {
        lts_issue_voucher_detail_id: req.params.ltsId,
        [db.Sequelize.Op.or]: [
          { is_deleted: { [db.Sequelize.Op.is]: null } },
          { is_deleted: { [db.Sequelize.Op.is]: false } },
        ],
      },
    });
    if (checkAssigned) {
      return responseHandler(req,
        res,
        500,
        false,
        "Assigned LTS can't be updated",
        {}
      );
    }

    // Delete existing SKTs and associated varieties
    const existingSkts = await db.SktDetails.findAll({
      where: {
        lts_issue_voucher_detail_id: req.params.ltsId,
      },
    });

    const varietiesIds = await db.SktVarieties.findAll({
      attributes: ["variety_id"],
      where: {
        skt_id: {
          [db.Sequelize.Op.in]: existingSkts.map((skt) => skt.id),
        },
      },
    });

    for (const existingSkt of existingSkts) {
      // Destroy the associated varieties
      await db.SktVarieties.destroy({
        where: {
          skt_id: existingSkt.id,
        },
      });
    }

    // Destroy the existing SKTs
    await db.SktDetails.destroy({
      where: {
        lts_issue_voucher_detail_id: req.params.ltsId,
      },
    });

    // Delete the LTS itself
    await db.LtsDetail.destroy({
      where: {
        id: req.params.ltsId,
      },
    });

    // delete all varities
    await db.VarietyDetail.destroy({
      where: {
        id: {
          [db.Sequelize.Op.in]: varietiesIds.map((skt) => skt.variety_id),
        },
      },
    });

    responseHandler(req,res, 200, true, "", {}, "Lts deleted successfully.");
  } catch (error) {
    responseHandler(req,res, 500, false, "Server error", error);
  }
};

// to update the lts data
exports.updateLTS = async (req, res) => {
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

    // Check if LTS exists
    let lts = await db.LtsDetail.findOne({
      where: {
        id: req.params.lts_Id,
      },
    });
    if (!lts) {
      return responseHandler(req,
        res,
        400,
        false,
        "LTS does not exist with this id",
        {}
      );
    }

    // Check if LTS is assigned
    // let checkAssigned = await db.AssignedLtsDetail.findOne({
    //   where: {
    //     lts_issue_voucher_detail_id: req.params.lts_Id,
    //     [db.Sequelize.Op.or]: [
    //       { is_deleted: { [db.Sequelize.Op.is]: null } },
    //       { is_deleted: { [db.Sequelize.Op.is]: false } },
    //     ],
    //   },
    // });
    // if (checkAssigned) {
    //   return responseHandler(req,
    //     res,
    //     500,
    //     false,
    //     "Assigned LTS can't be updated",
    //     {}
    //   );
    // }
    const {
      ltsNo,
      lts_date_and_time,
      type,
      fmn_id,
      skts,
      formationUpdateConfirmation,
      user_id
    } = req.body;
    // Check if the new LTS name is unique
    const existingLts = await db.LtsDetail.findOne({
      where: {
        name: ltsNo,
        id: {
          [db.Sequelize.Op.not]: req.params.lts_Id,
        },
      },
    });

    if (existingLts) {
      return responseHandler(req,
        res,
        403,
        false,
        "This LTS name already exists. Please use a different LTS name.",
        {}
      );
    }

    if (formationUpdateConfirmation) {
      // Destroy the existing SKTs
      await db.AssignedLtsDetail.destroy({
        where: {
          lts_issue_voucher_detail_id: req.params.lts_Id,
          [db.Sequelize.Op.or]: [
            { is_deleted: { [db.Sequelize.Op.is]: null } },
            { is_deleted: { [db.Sequelize.Op.is]: false } },
          ],
        },
      });
    }

    // Delete existing SKTs and associated varieties
    const existingSkts = await db.SktDetails.findAll({
      where: {
        lts_issue_voucher_detail_id: req.params.lts_Id,
      },
    });

    const varietiesIds = await db.SktVarieties.findAll({
      attributes: ["variety_id"],
      where: {
        skt_id: {
          [db.Sequelize.Op.in]: existingSkts.map((skt) => skt.id),
        },
      },
    });

    for (const existingSkt of existingSkts) {
      // Destroy the associated varieties
      await db.SktVarieties.destroy({
        where: {
          skt_id: existingSkt.id,
        },
      });
    }

    // Destroy the existing SKTs
    await db.SktDetails.destroy({
      where: {
        lts_issue_voucher_detail_id: req.params.lts_Id,
      },
    });
    // delete all varities
    await db.VarietyDetail.destroy({
      where: {
        id: {
          [db.Sequelize.Op.in]: varietiesIds.map((skt) => skt.variety_id),
        },
      },
    });
    // Create new SKTs and varieties
    const sktData = [];

    for (const skt of skts) {
      const newSkt = await db.SktDetails.create({
        name: skt.skt_name,
        lts_issue_voucher_detail_id: req.params.lts_Id,
      });

      for (const variety of skt.varieties) {
        const newVariety = await db.VarietyDetail.create({
          amk_number: variety.amk_number || null,
          nomenclature: variety.nomenclature || null,
          ipq: variety.ipq || null,
          package_weight: variety.package_weight || null,
          qty: variety.qty || null,
          number_of_package: variety.number_of_package || null,
          location_33_fad: variety.location_33_fad || null,
          fad_loading_point_lp_number:
            variety.fad_loading_point_lp_number || null,
        });

        await db.SktVarieties.create({
          skt_id: newSkt.id,
          variety_id: newVariety.id,
        });
      }

      sktData.push(newSkt);
    }

    // Update LTS details
    lts = await lts.update({
      name: ltsNo,
      lts_date_and_time: lts_date_and_time,
      type: type,
      fmn_id: fmn_id,
      updated_by: user_id,
    });

    const ltsData = {
      id: lts.id,
      lts_name: lts.name,
      skts: sktData,
    };

    responseHandler(req,
      res,
      200,
      true,
      "",
      { ...ltsData },
      "LTS updated successfully"
    );
  } catch (error) {
    responseHandler(req,res, 500, false, "Server error", { error });
  }
};

// get all lts data which is not assigned to any driver.
exports.getLTSDetailsGrouped = async (req, res) => {
  try {
    const assignedLts = await db.AssignedLtsDetail.findAll({
      attributes: ["lts_issue_voucher_detail_id"],
      where: {
        [Op.and]: [
          {
            [Op.or]: [{ is_deleted: null }, { is_deleted: false }],
          },
        ],
      },
    });
    const assignedLtsIds = assignedLts.map(
      (item) => item.lts_issue_voucher_detail_id
    );

    // Find all LTS data that is not in assignedLtsIds
    const allLts = await db.LtsDetail.findAll({
      where: {
        id: {
          [Op.notIn]: assignedLtsIds,
        },
      },
      include: [
        {
          model: db.formations,
          as: "formationData",
          attributes: ["formation_name"],
        },
      ],
    });

    if (!allLts || allLts.length === 0) {
      return responseHandler(req,res, 400, false, "No LTS data found", {});
    }

    // Initialize an array to store the transformed LTS data
    const allLtsData = await Promise.all(
      allLts.map(async (lts) => {
        const sktData = await getSktData(lts.id);
        const sktDataWithVarieties = await getSktDataWithVarieties(sktData);

        // Transform the data into the desired format
        return {
          lts_name: lts.name,
          type: lts.type,
          lts_date_and_time: lts.lts_date_and_time,
          formation_name: lts.formationData.formation_name,
          skts: sktDataWithVarieties,
        };
      })
    );

    responseHandler(req,
      res,
      200,
      true,
      "",
      { allLtsData },
      "Grouped LTS details fetched successfully."
    );
  } catch (error) {
    responseHandler(req,res, 500, false, "Server error", { error }, "");
  }
};
