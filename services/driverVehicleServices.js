const db = require("../models"); // Import database models
const { Op } = require("sequelize");

exports.handleDriverVehicleDetailsSave = async (driver_id) => {
  try {
    const driverVehicle = await db.DriverVehicleDetail.findByPk(driver_id, {
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

    return driverVehicle;
  } catch (error) {
    throw error;
  }
};

exports.fetchDriverRecords = async (whereCondition, whereForAssignLts, limitInt, offset) => {
  // Fetch data based on query parameters
  const driverData = await db.DriverVehicleDetail.findAndCountAll({
    ...(whereCondition && { where: whereCondition }),
    ...(limitInt && { limit: limitInt }),
    ...(offset && { offset: offset }),
    order: [["begin", "DESC"]],
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
        ...(whereForAssignLts && { where: whereForAssignLts }),
        include: [
          {
            model: db.LtsDetail,
            as: "ltsDetail",
            attributes: ["id", "name", "lts_date_and_time", "type"],
            include: [
              {
                model: db.SktDetails,
                as: "sktData",
                attributes: ["id", "name"],
                include: [
                  {
                    model: db.SktVarieties,
                    as: "sktvarityData",
                    attributes: ["id", "variety_id", "skt_id"],
                    include: [
                      {
                        model: db.VarietyDetail,
                        as: "varityData",
                        attributes: [
                          "amk_number",
                          "nomenclature",
                          "amn_shelf_life",
                          "ipq",
                          "qty",
                          "package_weight",
                          "number_of_package",
                          "location_33_fad",
                          "fad_loading_point_lp_number",
                        ],
                      },
                      {
                        model: db.VarietyLoadDetails,
                        as: "varietyLoadData",
                        attributes: [
                          "id",
                          "lot_number",
                          "lot_quantity",
                          "condition",
                          "pkg_type",
                          "load_status",
                        ],
                      },
                    ],
                  },
                ],
              }
            ]
          },
        ],
      },
      {
        model: db.VehicleType,
        as: "vehicleType",
        attributes: ["id", "vehicle_type", "description"],
      },
      {
        model: db.formations,
        as: "formation_details",
        attributes: ["id", "formation_name"],
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

  // Iterate through the driverData rows and transform
  let driversResult = driverData.rows.map(row => row.toJSON());

  // Build transformed result
  driversResult = driversResult.map(row => {
    const assignedLtsData = row.assignedLtsData || [];

    // Transform assignedLtsData into ltsData format
    const ltsData = assignedLtsData.map(assignedLts => {
      const ltsDetail = assignedLts.ltsDetail;

      // Transform sktData into skts format
      const skts = (ltsDetail?.sktData || []).map(skt => {
        // Transform varieties
        const varieties = (skt.sktvarityData || []).map(sktVariety => {
          const varietyDetail = sktVariety.varityData?.[0] || {};
          const varietyLoadData = sktVariety.varietyLoadData || [];

          // Transform lot_numbers
          const lot_numbers = varietyLoadData.map(lot => ({
            lot_number: lot.lot_number,
            lot_quantity: lot.lot_quantity,
            condition: lot.condition || "",
            pkg_type: lot.pkg_type || "",
            load_status: lot.load_status
          }));

          return {
            amk_number: varietyDetail.amk_number,
            nomenclature: varietyDetail.nomenclature,
            amn_shelf_life: varietyDetail.amn_shelf_life || "",
            ipq: varietyDetail.ipq,
            qty: varietyDetail.qty,
            package_weight: varietyDetail.package_weight,
            number_of_package: varietyDetail.number_of_package,
            location_33_fad: varietyDetail.location_33_fad,
            fad_loading_point_lp_number: varietyDetail.fad_loading_point_lp_number,
            is_loaded: assignedLts.is_loaded,
            lot_numbers: lot_numbers
          };
        });

        return {
          skt_name: skt.name,
          varieties: varieties
        };
      });

      return {
        lts_id: ltsDetail?.id,
        lts_name: ltsDetail?.name,
        lts_type: ltsDetail?.type,
        skts: skts
      };
    });

    // Remove assignedLtsData and add ltsData
    const { assignedLtsData: _, ...restRow } = row;

    return {
      ...restRow,
      ltsData: ltsData
    };
  });

  return { data: driversResult, count: driverData.count };
};
