// controllers/vehicleTypeController.js

const db = require('../models');
const responseHandler = require('../helpers/responseHandler');

exports.getVehicleTypes = async (req, res) => {
  try {
    const vehicleTypes = await db.VehicleType.findAll({
      attributes: ['id', 'vehicle_type', 'description']
    });

    responseHandler(req,res, 200, true, '', { vehicleTypes },"List fetch successful.");
  } catch (error) {
    responseHandler(req,res, 500, false, 'Server error', {error},"");
  }
};
