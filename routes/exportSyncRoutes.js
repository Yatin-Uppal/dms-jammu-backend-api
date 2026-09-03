"use strict";

const express = require("express");
const router = express.Router();
const exportSyncController = require("../controllers/exportSyncController");
const { verifyAccessToken } = require("../middleware/authMiddleware");

// Export gate sync endpoints
router.get("/export/locations", exportSyncController.getLocations);
router.post("/export/data-sync", exportSyncController.dataSync);
router.get("/export/sync-history", verifyAccessToken, exportSyncController.getSyncHistory);

module.exports = router;

