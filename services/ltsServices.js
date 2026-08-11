const db = require("../models");
const responseHandler = require("../helpers/responseHandler");
const { validationResult } = require("express-validator");
const { Sequelize, Op } = require("sequelize");

exports.getSktData = async (id) =>
  await db.SktDetails.findAll({
    where: {
      lts_issue_voucher_detail_id: id, // Use a valid lts_issue_voucher_detail_id
    },
    include: [
      {
        model: db.SktVarieties,
        as: "sktvarityData",
      },
    ],
  });
// Initialize an array to store the transformed skt data
exports.getSktDataWithVarieties = async (sktData) => {
  const sktDataWithVarieties = await Promise.all(
    sktData.map(async (skt) => {
      const sktVarieties = await Promise.all(
        skt.sktvarityData.map(async (variety) => {
          // Retrieve the variety data based on variety_id
          const varietyData = await db.VarietyDetail.findOne({
            where: {
              id: variety.variety_id,
            },
            attributes: [
              "id",
              "amk_number",
              "nomenclature",
              "amn_shelf_life",
              "ipq",
              "package_weight",
              "qty",
              "qty_required",
              "number_of_package",
              "location_33_fad",
              "fad_loading_point_lp_number",
            ],
          });
          const varietyLotsData = await db.VarietyLoadDetails.findAll({
            where: {
              skt_variety_id: variety.id,
            },
            attributes: [
              ["id", "lot_id"],
              "lot_number",
              "lot_quantity",
              "condition",
              "pkg_type",
              "load_status"
            ],
          });

          let amn_shelf_life = varietyData.amn_shelf_life;
          if (!amn_shelf_life && varietyData.amk_number && skt.name) {
            const amkQuantityRecord = await db.ManageAmkQuantity.findOne({
              where: {
                amk_number: varietyData.amk_number,
                location: skt.name,
                [db.Sequelize.Op.or]: [
                  { is_deleted: { [db.Sequelize.Op.is]: null } },
                  { is_deleted: { [db.Sequelize.Op.is]: false } },
                ],
              }
            });
            if (amkQuantityRecord) {
              amn_shelf_life = amkQuantityRecord.amn_shelf_life;
            }
          }

          const transformedLots = await Promise.all(varietyLotsData.map(async (lot) => {
            let condition = lot.condition;
            let pkg_type = lot.pkg_type;
            if ((!condition || !pkg_type) && varietyData.amk_number && skt.name) {
              const amkQuantityRecord = await db.ManageAmkQuantity.findOne({
                where: {
                  amk_number: varietyData.amk_number,
                  location: skt.name,
                  [db.Sequelize.Op.or]: [
                    { is_deleted: { [db.Sequelize.Op.is]: null } },
                    { is_deleted: { [db.Sequelize.Op.is]: false } },
                  ],
                }
              });
              if (amkQuantityRecord) {
                const lotDetailRecord = await db.AmkLotDetails.findOne({
                  where: {
                    amk_id: amkQuantityRecord.id,
                    lot_number: lot.lot_number,
                  }
                });
                if (lotDetailRecord) {
                  if (!condition) condition = lotDetailRecord.condition;
                  if (!pkg_type) pkg_type = lotDetailRecord.pkg_type;
                }
              }
            }
            return {
              lot_id: lot.getDataValue ? lot.getDataValue("lot_id") : lot.lot_id,
              lot_number: lot.lot_number,
              lot_quantity: lot.lot_quantity,
              condition: condition || "",
              pkg_type: pkg_type || "",
              load_status: lot.load_status
            };
          }));

          // Transform variety data
          return {
            variety_id: varietyData.id,
            amk_number: varietyData.amk_number,
            nomenclature: varietyData.nomenclature,
            amn_shelf_life: amn_shelf_life,
            ipq: varietyData.ipq,
            package_weight: varietyData.package_weight,
            qty: varietyData.qty,
            qty_required: varietyData.qty_required,
            lot_numbers: transformedLots,
            number_of_package: varietyData.number_of_package,
            location_33_fad: varietyData.location_33_fad,
            fad_loading_point_lp_number:
              varietyData.fad_loading_point_lp_number,
          };
        })
      );

      return {
        skt_id: skt.id,
        skt_name: skt.name,
        varieties: sktVarieties,
      };
    })
  );

  return sktDataWithVarieties;
};
