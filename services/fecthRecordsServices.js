const responseHandler = require("../helpers/responseHandler");
const db = require("../models");
const { Op } = require("sequelize");
exports.fetchRecordServices = async (req, res) => {
  let begin = req.query.begin;
  let end = req.query.end;
  let fmn = req.query.fmn_id ? parseInt(req.query.fmn_id) : "";

  const whereCondition = {
    [Op.or]: [{ is_deleted: { [Op.is]: null } }, { is_deleted: false }],
  };

  const driverVehicleWhere = {};

  if (fmn) {
    // Add fmn_id condition to filter AssignedLtsDetail based on LtsDetail's fmn_id
    driverVehicleWhere["fmn_id"] = fmn;
  }
  if (begin && end) {
    driverVehicleWhere["begin"] = {
      [Op.gte]: new Date(`${begin}`),
      [Op.lte]: new Date(`${end}`),
    };
    driverVehicleWhere["end"] = {
      [Op.gte]: new Date(`${begin}`),
      [Op.lte]: new Date(`${end}`),
    };
  }

  try {
    let driverData = await db.DriverVehicleDetail.findAndCountAll({
      ...(Object.keys(driverVehicleWhere).length > 0
        ? { where: { ...driverVehicleWhere } }
        : {}),
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
          where: { ...whereCondition },
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
                  order: [["id", "ASC"]],
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
                          order: [["id", "ASC"]],
                        },
                        {
                          model: db.VarietyLoadStatusDetail,
                          as: "sktvarietyLoadData",
                          attributes: [
                            "id",
                            "driver_vehicle_id",
                            "skt_variety_id",
                            "lot_number",
                            "qty",
                            "is_loaded",
                            "loaded_by",
                            "loaded_time",
                          ],
                          order: [["id", "ASC"]],

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
      return responseHandler(req,res, 404, false, "No data found", {}, "");
    }
    // responseHandler(req,res, 200, false, "", driverData.rows, "Success");

    return driverData.rows;
  } catch (error) {
    throw error;
  }
};

exports.fetchAmkListrecords = async (req, res) => {
  let begin = req.query.begin;
  let end = req.query.end;
  let fmn = req.query.fmn_id ? parseInt(req.query.fmn_id) : 0;

  try {
    const results = await db.sequelize.query(`CALL sp_amk_report(?, ?, ?)`, {
      replacements: [begin, end, fmn],
    });
    // Process the results as needed
    const responseData = results; // Assuming the stored procedure returns the data you need
    // responseHandler(req,res, 200, true, "", responseData, "Dashboard list fetched successfully");
    return responseData;
  } catch (error) {
    // Handle errors
    throw error;
  }
};
