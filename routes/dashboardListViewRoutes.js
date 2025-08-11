// routes/driverVehicleRoutes.js

const express = require("express");
const { body } = require("express-validator");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const dashboardListView = require("../controllers/dashboardListViewController")

// get the dashboard list data
router.get("/dashboard_list_view/:date_range?/:fmn_id?",
  authMiddleware.verifyAccessToken,
  dashboardListView.getDashboardListData);

  // get the mobile dashboard list data according to series
  router.get("/mobile_dashboard_list_view/:date_range?/:series?",
  authMiddleware.verifyAccessToken,
  dashboardListView.getMobileDashboardListData);



module.exports = router;
