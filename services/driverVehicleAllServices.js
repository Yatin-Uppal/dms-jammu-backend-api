const db = require("../models");

// Create a function to get LTS data for a specific driver
exports.getLtsDataForDriver = async (driverId, fmnId) => {
  try {
    // Retrieve LTS IDs assigned to other drivers
    const assignedOtherLTS = await db.AssignedLtsDetail.findAll({
      where: {
        driver_vehicle_detail_id: {
          [db.Sequelize.Op.ne]: driverId, // Exclude the specific driver
        },
        [db.Sequelize.Op.or]: [
          { is_deleted: { [db.Sequelize.Op.is]: null } },
          { is_deleted: { [db.Sequelize.Op.is]: false } },
        ],
      },
      attributes: ["lts_issue_voucher_detail_id"],
    });

    const assignedOtherLtsIds = assignedOtherLTS.map(
      (assignment) => assignment.lts_issue_voucher_detail_id
    );
    // Fetch all LTS data for the specific FMN
    const allLtsData = await db.LtsDetail.findAll({
      where: {
        fmn_id: fmnId,
      },
      attributes: ["id", "name", "lts_date_and_time", "type"],
    });

    // Filter LTS data to eliminate those assigned to other drivers
    const ltsData = allLtsData.filter(
      (lts) => !assignedOtherLtsIds.includes(lts.id)
    );

    return ltsData;
  } catch (error) {
    throw error;
  }
};

// Create a function to get driver data with pagination
exports.getDriverListData = async (whereClause, offset, limit) => {
  try {
    const driverList = await db.DriverVehicleDetail.findAll({
      where: { ...whereClause },
      offset,
      limit,
      order: [["record_id", "DESC"]],
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
        "begin_by",
        "resource",
        "title",
        "created_at",
        "remark"
      ],
      include: [
        // Include necessary associations to fetch related data
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
          model: db.VehicleType,
          as: "vehicleType",
          attributes: ["id", "vehicle_type"],
        },
        {
          model: db.formations,
          as: "formation_details",
          attributes: ["id", "formation_name"],
        },
      ],
    });

    return driverList;
  } catch (error) {
    throw error;
  }
};

//- Driver vehichle to show the prefilled details
exports.getDriverData = async (whereClause) => {
  try {
    const driverList = await db.DriverVehicleDetail.findOne({
      where: { ...whereClause },
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
        "begin_by",
        "resource",
        "title",
        "created_at",
      ],
      include: [
        // Include necessary associations to fetch related data
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
          model: db.VehicleType,
          as: "vehicleType",
          attributes: ["id", "vehicle_type"],
        },
        {
          model: db.formations,
          as: "formation_details",
          attributes: ["id", "formation_name"],
        },
      ],
    });

    return driverList;
  } catch (error) {
    throw error;
  }
};

// get the number of rounds for the vehicle numbers
exports.countDriversByVehicleNumber = async (whereClause) => {
  try {
    const count = await db.DriverVehicleDetail.count({
      where: { ...whereClause },
    });
    
    return count;
  } catch (error) {
    throw error;
  }
};
