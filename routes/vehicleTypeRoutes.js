// routes/vehicleTypeRoutes.js

const express = require('express');
const router = express.Router();
const vehicleTypeController = require('../controllers/vehicleTypeController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/vehicle-types',authMiddleware.verifyAccessToken, vehicleTypeController.getVehicleTypes);

module.exports = router;
