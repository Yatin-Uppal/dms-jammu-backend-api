const responseHandler = require("../helpers/responseHandler");
const db = require("../models");
const { Op } = require("sequelize");

exports.handleUpdatedAssignedLTS = async (driverVehicleId, res) => {
  try {
    const driverData = await db.DriverVehicleDetail.findOne({
      where: {
        id: driverVehicleId, // Retrieve data for all assigned LTS records
      },
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
        "fmn",
        "begin",
        "begin_by",
        "resource",
        "title",
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
            },
          ],
          where: {
            [Op.or]: [{ is_deleted: null }, { is_deleted: false }],
          },
          required: false,
        },
        {
          model: db.VehicleType,
          as: "vehicleType",
          attributes: ["id", "vehicle_type"],
        },
        {
          model: db.VehicleCapacity,
          as: "VehicleCapacity",
          attributes: ["id", "capacity"],
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
      ],
    });
    if (!driverData) {
      return responseHandler(req,res, 404, false, "Driver data not found", {}, "");
    }

    // Fetch LTS Varieties data
    const ltsVarieties = await db.LTSVariety.findAll({
      attributes: [
        "id",
        "lts_issue_voucher_id",
        "variety_id",
        "is_loaded",
        "loaded_time",
        "loaded_by",
      ],
      include: [
        {
          model: db.LtsDetail,
          as: "ltsDetail",
          attributes: ["id", "name", "lts_date_and_time", "type"],
        },
        {
          model: db.VarietyDetail,
          as: "varietyDetail",
          attributes: [
            "id",
            "lot",
            "skt_name",
            "amk_number",
            "nomenclature_ipq",
            "qty",
            "number_of_package",
            "location_33_fad",
            "fad_loading_point_lp_number",
          ],
        },
        {
          model: db.User,
          as: "loadedBy",
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

    const groupedLTSDetails = ltsVarieties.reduce((acc, ltsVariety) => {
      const lts_id = ltsVariety.ltsDetail.id;
      if (!acc[lts_id]) {
        acc[lts_id] = {
          ltsDetail: ltsVariety.ltsDetail,
          varieties: [],
        };
      }
      // Create a variety object with LTSVariety IDs
      const variety = {
        ...ltsVariety.varietyDetail.dataValues,
        lts_variety_id: ltsVariety.id,
        is_loaded: ltsVariety.is_loaded,
        loaded_time: ltsVariety.loaded_time,
        loadedBy: ltsVariety.loadedBy?.dataValues,
      };
      acc[lts_id].varieties.push(variety);
      return acc;
    }, {});

    const groupedLTSDetailsArray = Object.values(groupedLTSDetails);

    // Integrate groupedLTSDetailsArray with driverData
    groupedLTSDetailsArray.forEach((groupedLTS) => {
      const foundLTS = driverData.assignedLtsData.find(
        (assignedLTS) =>
          assignedLTS.ltsDetail &&
          assignedLTS.ltsDetail.id === groupedLTS.ltsDetail.id
      );
      if (foundLTS) {
        foundLTS.setDataValue("skts", groupedLTS.varieties);
      }
    });

    return driverData;
  } catch (error) {
    throw error;
  }
};
