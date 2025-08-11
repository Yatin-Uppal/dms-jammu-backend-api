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
              "amk_number",
              "nomenclature",
              "ipq",
              "package_weight",
              "qty",
              "number_of_package",
              "location_33_fad",
              "fad_loading_point_lp_number",
            ],
          });

          // Transform variety data
          return {
            amk_number: varietyData.amk_number,
            nomenclature: varietyData.nomenclature,
            ipq: varietyData.ipq,
            package_weight: varietyData.package_weight,
            qty: varietyData.qty,
            number_of_package: varietyData.number_of_package,
            location_33_fad: varietyData.location_33_fad,
            fad_loading_point_lp_number:
              varietyData.fad_loading_point_lp_number,
          };
        })
      );

      return {
        skt_name: skt.name,
        varieties: sktVarieties,
      };
    })
  );

  return sktDataWithVarieties;
};
