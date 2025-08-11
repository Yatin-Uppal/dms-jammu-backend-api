const db = require("../models");

exports.fetchLatestRecordID = async () => {
  // Get the greatest record_id value from the DriverVehicleDetail table
  const latestRecord = await db.DriverVehicleDetail.findOne({
    attributes: [
      [
        db.sequelize.fn("MAX", db.sequelize.col("record_id")),
        "max_record_id",
      ],
    ],
  });
  let record_id;

  if (latestRecord.dataValues.max_record_id) {
    const lastRecordNumber = parseInt(
      latestRecord.dataValues.max_record_id.split("-")[1]
    );
    record_id = `ACTM-${(lastRecordNumber + 1).toString().padStart(6, "0")}`;
  } else {
    record_id = "ACTM-000001";
  }
  return  record_id;
}