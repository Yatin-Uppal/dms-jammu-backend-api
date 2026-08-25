const db = require("../models");
const { Op } = require("sequelize");
async function getAMKQuantityService({
  amk_number,
  location,
  sortedColumn,
  stock_status = "all",
  page,
  limit,
  amkAssignedData = [],
}) {
  const pageInt = parseInt(page);
  const limitInt = parseInt(limit);

  const whereClause = {
    ...(amk_number && {
      amk_number: { [db.Sequelize.Op.like]: `%${amk_number}%` },
    }),
    ...(location && {
      location: { [db.Sequelize.Op.like]: `%${location}%` },
    }),
    [db.Sequelize.Op.or]: [
      { is_deleted: { [db.Sequelize.Op.is]: null } },
      { is_deleted: { [db.Sequelize.Op.is]: false } },
    ],
  };

  let rows = await db.ManageAmkQuantity.findAll({
    distinct: true,
    attributes: ["id", "amk_number", "location", "amn_shelf_life", "total_quantity", "created_at"],
    include: [
      {
        model: db.AmkLotDetails,
        as: "amkLotDetails",
        attributes: ["id", "lot_number", "lot_quantity", "qr_code", "created_at"],
      },
    ],
    where: { ...whereClause },
    order: [["created_at", "DESC"], [sortedColumn, "ASC"]],
  });

  const rawData = rows.map(row => row.toJSON());
  let processedData = await processResultData(amkAssignedData, rawData);

  if (stock_status === "available_stock") {
    processedData = processedData.filter(item => Number(item.balance_quantity) > 0);
  } else if (stock_status === "out_of_stock") {
    processedData = processedData.filter(item => Number(item.balance_quantity) <= 0);
  }

  const totalCount = processedData.length;
  const totalPage = Math.ceil(totalCount / limitInt);
  const offset = pageInt > 1 ? (pageInt - 1) * limitInt : 0;
  const paginatedData = processedData.slice(offset, offset + limitInt);

  return { amkQuantityData: paginatedData, totalCount, totalPage };
}

async function processResultData(amkAssignedData, amkQuantityData) {
  return amkQuantityData.map((amkData) => {
    const { id, amk_number, location, amn_shelf_life, total_quantity } = amkData;

    const calculatedQuantity = calculateAssignedAndLoadedQuantity(
      amkAssignedData,
      amk_number,
      location
    );

    return {
      id,
      amk_number,
      amn_shelf_life,
      location,
      total_quantity,
      assigned_quantity: (calculatedQuantity.totalAssignedQuantity || 0).toFixed(2),
      loaded_quantity: (calculatedQuantity.totalLoadedQuantity || 0).toFixed(2),
      balance_quantity: (total_quantity - (calculatedQuantity.totalAssignedQuantity || 0)).toFixed(2),
      actual_quantity: (total_quantity - (calculatedQuantity.totalLoadedQuantity || 0)).toFixed(2),
    };
  });
}

function calculateAssignedAndLoadedQuantity(assignedData, amk_number, location) {
  let totalAssignedQuantity = 0;
  let totalLoadedQuantity = 0;

  for (const item of assignedData) {
    if (item.name !== location) continue;
    
    const sktVarities = item.sktvarityData;
    if (!sktVarities) continue;

    for (let i = 0; i < sktVarities.length; i++) {
      const varieties = sktVarities[i].varityData;
      for (let j = 0; j < varieties.length; j++) {
        if (varieties[j].amk_number !== amk_number) continue;
        
        totalAssignedQuantity += Number(varieties[j].qty || 0);

        const sktVarietyLotData = sktVarities[i].varietyLoadData;
        if (sktVarietyLotData?.length) {
          for (const lot of sktVarietyLotData) {
            if (lot.load_status !== 'Pending' && lot.loaded_time) {
              totalLoadedQuantity += Number(lot.lot_quantity || 0);
            }
          }
        }
      }
    }
  }

  return { totalAssignedQuantity, totalLoadedQuantity };
}

async function getAMKUploadSheets(whereClause, limit, offset, page) {
  const limitInt = parseInt(limit);
  const pageInt = parseInt(page);
  const { count, rows } = await db.AmkExcelSheets.findAndCountAll({
    where: whereClause,
    attributes: ['id', 'excel_file_name', 'file_id', 'uploaded_by', 'store_type', 'total_inventory_uploaded', 'created_at'],
    order: [['created_at', 'DESC']],
    limit,
    offset
  });

  // Calculate pagination metadata
  const totalPages = Math.ceil(count / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  return {
    success: true,
    data: rows,
    pagination: {
      total: count,
      totalPages,
      currentPage: pageInt,
      pageSize: limitInt,
      hasNextPage,
      hasPrevPage
    }
  }
}

module.exports = {
  getAMKQuantityService,
  processResultData,
  calculateAssignedAndLoadedQuantity,
  getAMKUploadSheets
};
