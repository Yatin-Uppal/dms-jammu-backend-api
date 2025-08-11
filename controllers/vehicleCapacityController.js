// controllers/vehicleCapacityController.js

const db = require('../models');
const responseHandler = require('../helpers/responseHandler');

exports.getVehicleCapacities = async (req, res) => {
  try {
    const vehicleCapacities = await db.VehicleCapacity.findAll({
      attributes: ['id', 'capacity', 'description']
    });

    responseHandler(req,res, 200, true, '', { vehicleCapacities },"List fetch Successful.");
  } catch (error) {
    responseHandler(req,res, 500, false, 'Server error', {error},"");
  }
};
