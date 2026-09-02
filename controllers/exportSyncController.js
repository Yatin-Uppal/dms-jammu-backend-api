"use strict";

const responseHandler = require("../helpers/responseHandler");
const exportSyncService = require("../services/exportSyncService");

/**
 * GET /api/export/locations
 * Returns list of unique location strings from amk_quantities
 */
const getLocations = async (req, res, next) => {
  try {
    const locations = await exportSyncService.getUniqueLocations();
    return responseHandler(
      req,
      res,
      200,
      true,
      "",
      locations,
      "Locations fetched successfully"
    );
  } catch (error) {
    console.error("Error fetching locations:", error);
    return responseHandler(req, res, 500, false, "Server error", null, error.message);
  }
};

/**
 * POST /api/export/data-sync
 * Syncs mobile NFC export data, auto-imports AMK lots, and logs history
 */
const dataSync = async (req, res, next) => {
  try {
    const payload = req.body;
    if (!payload || !payload.amk_items || !Array.isArray(payload.amk_items) || payload.amk_items.length === 0) {
      return responseHandler(
        req,
        res,
        400,
        false,
        "amk_items array is required and must not be empty",
        null,
        "amk_items array is required and must not be empty"
      );
    }

    const result = await exportSyncService.syncAndImport(payload, req.user);

    return responseHandler(
      req,
      res,
      200,
      true,
      "",
      result,
      "Data synced and imported successfully"
    );
  } catch (error) {
    console.error("Error syncing export data:", error);
    return responseHandler(req, res, 500, false, "Server error", null, error.message);
  }
};

/**
 * GET /api/export/sync-history
 * Paginated list of export sync history entries with filters
 */
const getSyncHistory = async (req, res, next) => {
  try {
    const result = await exportSyncService.getSyncHistoryList(req.query);

    return responseHandler(
      req,
      res,
      200,
      true,
      "",
      result,
      "Export Sync History fetched successfully"
    );
  } catch (error) {
    console.error("Error fetching sync history:", error);
    return responseHandler(req, res, 500, false, "Server error", null, error.message);
  }
};

module.exports = {
  getLocations,
  dataSync,
  getSyncHistory,
};

