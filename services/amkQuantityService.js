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

    const assignedQuantityData = findAssignedQuantity(
      assignedData,
      amk_number,
      location_33_fad
    );
    const assignedQuantity = calculateAssignedQuantity(
      assignedQuantityData,
      amk_number
    );

    const loadedQuantityData = findLoadedQuantity(
      loadData,
      amk_number,
      location_33_fad
    );
    const loadedQuantity = calculateLoadedQuantity(loadedQuantityData);

    return {
      ...amkData,
      assignedQuantity: assignedQuantity || 0,
      loadedQuantity: loadedQuantity || 0,
      balance: amkData.total_quantity - (loadedQuantity || 0),
    };
  });
}

function findAssignedQuantity(assignedData, amk_number, location_33_fad) {
  return assignedData.find((item) =>
    item.sktvarityData.some((sktVarityData) =>
      sktVarityData.varityData.some(
        (varityData) =>
          varityData.amk_number === amk_number && item.name === location_33_fad
      )
    )
  );
}

function calculateAssignedQuantity(assignedQuantityData, amk_number) {
  return (
    assignedQuantityData &&
    assignedQuantityData.sktvarityData.reduce((acc, sktVarityData) => {
      const assignedVarityData = sktVarityData.varityData.find(
        (varityData) => varityData.amk_number === amk_number
      );
      if (assignedVarityData) {
        acc += assignedVarityData.qty * assignedVarityData.number_of_package;
      }
      return acc;
    }, 0)
  );
}

function findLoadedQuantity(loadData, amk_number, location_33_fad) {
  return loadData.find((item) =>
    item.sktvarityData.some((sktVarityData) =>
      sktVarityData.varityData.some(
        (varityData) =>
          varityData.amk_number === amk_number && item.name === location_33_fad
      )
    )
  );
}

function calculateLoadedQuantity(loadedQuantityData) {
  return (
    loadedQuantityData &&
    loadedQuantityData.sktvarityData.reduce((acc, sktVarityData) => {
      const loadedData = sktVarityData.sktVarietyLotData.find(
        (loadData) => loadData.skt_variety_id === sktVarityData.variety_id
      );
      if (loadedData) {
        acc += Number(loadedData.lot_quantity);
      }
      return acc;
    }, 0)
  );
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
