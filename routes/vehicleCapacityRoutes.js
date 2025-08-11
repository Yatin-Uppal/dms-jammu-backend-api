// routes/vehicleCapacityRoutes.js

const express = require('express');
const router = express.Router();
const vehicleCapacityController = require('../controllers/vehicleCapacityController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/vehicle-capacities',authMiddleware.verifyAccessToken, vehicleCapacityController.getVehicleCapacities);

module.exports = router;
