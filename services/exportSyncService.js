"use strict";

const db = require("../models");
const { processRecordsInBatches } = require("../helpers/excelTojson");

/**
 * Get distinct unique locations from amk_quantities
 */
const getUniqueLocations = async () => {
  const locations = await db.ManageAmkQuantity.findAll({
    attributes: [
      [db.Sequelize.fn("DISTINCT", db.Sequelize.col("location")), "location"],
    ],
    where: {
      location: {
        [db.Sequelize.Op.ne]: null,
        [db.Sequelize.Op.ne]: "",
      },
      [db.Sequelize.Op.or]: [
        { is_deleted: { [db.Sequelize.Op.is]: null } },
        { is_deleted: false },
      ],
    },
    order: [["location", "ASC"]],
    raw: true,
  });

  return locations
    .map((item) => (item.location ? item.location.trim() : ""))
    .filter((loc) => loc.length > 0)
    .filter((loc, idx, arr) => arr.indexOf(loc) === idx);
};

/**
 * Process NFC Export Data Sync: Auto-import AMK lot data and record history
 */
const syncAndImport = async (payload, user) => {
  const {
    parent_depot_name,
    vehicle_number,
    driver_name,
    unit,
    checkout_time,
    scanned_at,
    lts_name,
    formation_name,
    amk_items,
  } = payload;

  if (!Array.isArray(amk_items) || amk_items.length === 0) {
    throw new Error("amk_items array is required and must not be empty");
  }

  let totalLotsCount = 0;
  let totalQty = 0;
  let newLocationsCount = 0;
  const rows = [];

  for (const item of amk_items) {
    const amkNo = item.amk_number || item.amk;
    if (!amkNo) {
      continue;
    }

    const targetLoc =
      item.new_location ||
      item.old_location ||
      item.loc ||
      item.shed_location ||
      item.shed_loc ||
      "DEFAULT";

    if (item.is_custom_location) {
      newLocationsCount++;
    }

    const nomenclature = item.nomenclature || "";
    const amn_shelf_life = item.amn_shelf_life || null;

    if (Array.isArray(item.lots) && item.lots.length > 0) {
      for (const lot of item.lots) {
        const lotQty = Number(lot.lot_quantity ?? lot.qty_bal ?? 0);
        totalLotsCount++;
        totalQty += lotQty;
        rows.push({
          amk: amkNo,
          loc: targetLoc,
          crity_lot: lot.lot_number || lot.crity_lot || "AUTO_LOT",
          qty_bal: lotQty,
          pkg_type: lot.pkg_type || "Box",
          condition: lot.condition || "SER",
          amn_shelf_life,
          nomenclature,
        });
      }
    } else {
      const itemQty = Number(
        item.given_quantity ?? item.lot_quantity ?? item.qty_bal ?? 0
      );
      totalLotsCount++;
      totalQty += itemQty;
      rows.push({
        amk: amkNo,
        loc: targetLoc,
        crity_lot: item.lot_number || item.crity_lot || "AUTO_LOT",
        qty_bal: itemQty,
        pkg_type: item.pkg_type || "Box",
        condition: item.condition || "SER",
        amn_shelf_life,
        nomenclature,
      });
    }
  }

  const uploaderName = user
    ? user.username || `${user.first_name || ""} ${user.last_name || ""}`.trim()
    : "Mobile App";

  // Create synthetic excel sheet record for tracking
  const excelFileRecord = await db.AmkExcelSheets.create({
    file_id: `export_sync_${Date.now()}`,
    excel_file_name: `export_sync_${Date.now()}`,
    uploaded_by: uploaderName,
    store_type: "export_sync",
    depth: 0,
    tonnage: 0,
    total_inventory_uploaded: totalQty,
    is_deleted: false,
  });

  // Perform the batch import into ManageAmkQuantity & AmkLotDetails
  const batchResult = await processRecordsInBatches(rows, excelFileRecord, db);

  const importSummary = {
    total_amk_items: amk_items.length,
    total_lots_imported: totalLotsCount,
    new_locations_created: newLocationsCount,
    success_count: batchResult?.successCount || 0,
    error_count: batchResult?.errorCount || 0,
  };

  // Create history log entry
  const historyRecord = await db.ExportSyncHistory.create({
    parent_depot_name: parent_depot_name || null,
    vehicle_number: vehicle_number || null,
    driver_name: driver_name || null,
    unit: unit || null,
    checkout_time: checkout_time ? new Date(checkout_time) : null,
    scanned_at: scanned_at ? new Date(scanned_at) : new Date(),
    lts_name: lts_name || null,
    formation_name: formation_name || null,
    sync_data: payload,
    import_summary: importSummary,
    synced_by: user ? user.id : null,
  });

  return {
    history_id: historyRecord.id,
    import_summary: importSummary,
  };
};

/**
 * Fetch paginated Export Sync History records with filters
 */
const getSyncHistoryList = async (queryParams) => {
  const {
    page = 1,
    limit = 10,
    vehicle_number,
    parent_depot_name,
    startDate,
    endDate,
    synced_by,
  } = queryParams;

  const whereClause = {};

  if (vehicle_number) {
    whereClause.vehicle_number = {
      [db.Sequelize.Op.like]: `%${vehicle_number}%`,
    };
  }

  if (parent_depot_name) {
    whereClause.parent_depot_name = {
      [db.Sequelize.Op.like]: `%${parent_depot_name}%`,
    };
  }

  if (startDate && endDate) {
    const isValidDate = (d) => !isNaN(Date.parse(d));
    if (isValidDate(startDate) && isValidDate(endDate)) {
      whereClause.created_at = {
        [db.Sequelize.Op.between]: [
          new Date(`${startDate} 00:00:00`),
          new Date(`${endDate} 23:59:59`),
        ],
      };
    }
  }

  if (synced_by) {
    whereClause.synced_by = synced_by;
  }

  const pageInt = parseInt(page, 10) || 1;
  const limitInt = parseInt(limit, 10) || 10;

  const result = await db.ExportSyncHistory.findAndCountAll({
    where: whereClause,
    limit: limitInt,
    offset: (pageInt - 1) * limitInt,
    order: [["created_at", "DESC"]],
    include: [
      {
        model: db.User,
        as: "syncedByUser",
        attributes: ["id", "role_id", "first_name", "last_name", "username"],
        include: [
          { model: db.Role, as: "role_data", attributes: ["id", "role"] },
        ],
      },
    ],
  });

  return {
    total: result.count,
    history: result.rows,
    page: pageInt,
    totalPages: Math.ceil(result.count / limitInt),
  };
};

module.exports = {
  getUniqueLocations,
  syncAndImport,
  getSyncHistoryList,
};

