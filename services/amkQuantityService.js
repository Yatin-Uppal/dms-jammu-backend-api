const db = require("../models");
const { Op } = require("sequelize");
async function getAMKQuantityService({
  amk_number,
  location_33_fad,
  total_quantity,
  page,
  limit, store_type,
}) {
  const offset = page > 1 ? (page - 1) * limit : 0;

  const whereClause = {
    ...(amk_number && {
      amk_number: { [db.Sequelize.Op.like]: `%${amk_number}%` },
    }),
    ...(location_33_fad && {
      location_33_fad: { [db.Sequelize.Op.like]: `%${location_33_fad}%` },
    }),
    ...(store_type && {
      inv_of_store_type: { [db.Sequelize.Op.like]: `%${store_type}%` },
    }),
    ...(total_quantity && {
      total_quantity: { [db.Sequelize.Op.like]: `%${total_quantity}%` },
    }),
    [db.Sequelize.Op.or]: [
      { is_deleted: { [db.Sequelize.Op.is]: null } },
      { is_deleted: { [db.Sequelize.Op.is]: false } },
    ],
  };

  let {count, rows} = await db.ManageAmkQuantity.findAndCountAll({
    attributes: ["id", "amk_number", "total_quantity", "sr_no", "location_33_fad"],
    where: { ...whereClause },
    offset,
    limit,
    raw: true,
    order: [["id", "DESC"]],
  });

  const totalPage = parseInt(count / limit) + 1;
  return { amkQuantityData:rows, totalCount:count ,totalPage};
}

async function processResultData(assignedData, loadData, amkQuantityData) {
  return amkQuantityData.map((amkData) => {
    const { amk_number, location_33_fad } = amkData;

    const assignedQuantity = findAndCalculateAssignedQuantity(
      assignedData,
      amk_number,
      location_33_fad
    );

    const loadedQuantity = findAndCalculateLoadedQuantity(
      loadData,
      amk_number,
      location_33_fad
    );

    return {
      ...amkData,
      assignedQuantity: (assignedQuantity || 0).toFixed(2),
      loadedQuantity: (loadedQuantity || 0).toFixed(2),
      balance: (amkData.total_quantity - (loadedQuantity || 0)).toFixed(2),
    };
  });
}

function findAndCalculateAssignedQuantity(assignedData, amk_number, location_33_fad) {
  let total = 0;

  for (const item of assignedData) {
    if (item.name !== location_33_fad) continue;

    const sktVarities = item.sktvarityData;
    if (!sktVarities) continue;

    for (const skt of sktVarities) {
      const varieties = skt.varityData;
      if (!varieties) continue;

      for (const variety of varieties) {
        if (variety.amk_number === amk_number) {
          total += Number(variety.qty || 0);
        }
      }
    }
  }

  return total || null;
}

function findAndCalculateLoadedQuantity(data, amk_number, location_33_fad) {
  let total = 0;

  for (const item of data) {
    if (item.name !== location_33_fad) continue;

    for (const skt of item.sktvarityData ?? []) {
      // check if this skt variety matches the AMK
      const hasAmk = skt.varityData?.some(
        variety => variety.amk_number === amk_number
      );

      if (!hasAmk) continue;

      // sum only LOADED lots
      for (const lot of skt.sktVarietyLotData ?? []) {
        if (lot.load_status === 'Loaded') {
          total += Number(lot.lot_quantity || 0);
        }
      }
    }
  }

  return total;
}

async function getAMKUploadSheets(whereClause, limit, offset, page) {
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
      currentPage: page,
      pageSize: limit,
      hasNextPage,
      hasPrevPage
    }
  }
}

module.exports = {
  getAMKQuantityService,
  processResultData,
  getAMKUploadSheets
};
