const db = require("../models");

// Returns all the LTS irrespective of created LOT or not
exports.getAllLtsList = async () => {
    try {
        const ltsList = await db.LtsDetail.findAll({
            attributes: ["id", "name"],
            where: {
                [db.Sequelize.Op.or]: [
                    { is_deleted: { [db.Sequelize.Op.is]: null } }, // Exclude null values
                    { is_deleted: { [db.Sequelize.Op.is]: false } }, // Exclude false values
                ],
            },
            order: [["created_at", "DESC"]],
        });
        return ltsList;
    } catch (error) {
        throw error;
    }
}

exports.getVarietyLotsList = async (parameters) => {
    const page = parameters?.pageNo ? parameters.pageNo : 1;
    const limit = parameters?.limit ? parameters.limit : 10;
    const offset = page > 1 ? (page - 1) * limit : 0;

    const lts_number = parameters?.lts_number ? parameters.lts_number : null;
    const start_date = parameters?.start_date ? parameters.start_date : null;
    const end_date = parameters?.end_date ? parameters.end_date : null;
    const variety_amk_no = parameters?.variety_amk_no ? parameters.variety_amk_no : null;
    const location = parameters?.location ? parameters.location : null;

    const { rows, count } = await db.SktVarieties.findAndCountAll({
        include: [
            {
                model: db.SktDetails,
                as: "sktData",
                required: false,
                attributes: ["name"],
                where: {
                    ...(location && { name: location }),
                },
                include: [
                    {
                        model: db.LtsDetail,
                        as: "ltsDetail",
                        required: false,
                        attributes: ["name"],
                        where: {
                            ...(lts_number && { name: lts_number }),
                            [db.Sequelize.Op.or]: [
                                { is_deleted: { [db.Sequelize.Op.is]: null } }, // Exclude null values
                                { is_deleted: { [db.Sequelize.Op.is]: false } }, // Exclude false values
                            ]
                        },
                        include: [
                            {
                                model: db.User,
                                as: "createdBy",
                                required: false,
                                attributes: [
                                    "username",
                                    "first_name",
                                    "last_name",
                                ]
                            },
                        ]
                    },
                ],
            },
            {
                model: db.VarietyDetail,
                as: "varityData",
                attributes: ["id", "amk_number", "nomenclature", "qty"],
                where: {
                    ...(variety_amk_no && { amk_number: variety_amk_no }),
                },
            },
            {
                model: db.VarietiesLotDetails,
                as: "sktVarietyLotData",
                where: {
                    ...(start_date && end_date) && {
                        created_at: {
                            [db.Sequelize.Op.gte]: new Date(start_date).setHours(0, 0, 0, 0),
                            [db.Sequelize.Op.lte]: new Date(end_date).setHours(23, 59, 59, 999),
                        },
                    },
                },
            }
        ],
        order: [["created_at", "DESC"]],
        limit,
        offset,
    });

    const transformRows = rows.map(sktVariety => {
        const { sktData, varityData, sktVarietyLotData } = sktVariety;
        const ltsDetail = sktData?.ltsDetail;
        const createdBy = ltsDetail?.createdBy;
        
        if (!sktData?.name || !ltsDetail?.name) {
            return null;
        }

        // LOT list
        const lotDetails = (sktVarietyLotData || []).map(lot => ({
            lot_id: lot.id,
            skt_variety_id: lot.skt_variety_id,
            lot_number: lot.lot_number,
            lot_quantity: Number(lot.lot_quantity),
            lot_load_status: lot.load_status,
            qr_reference_id: lot.qr_reference_id,
            lot_created_at: lot.created_at,
        }));

        // Total Quantity of LOTS
        const totalLotQuantity = lotDetails.reduce(
            (sum, lot) => sum + (lot.lot_quantity || 0),
            0
        );

        return {
            // Variety Info
            variety_id: sktVariety.id,
            amk_number: varityData?.[0]?.amk_number,
            nomenclature: varityData?.[0]?.nomenclature,
            total_qty: varityData?.[0]?.qty,
            created_at: sktVariety.created_at,

            // SKT Info
            skt_name: sktData?.name,

            // LTS Info
            lts_number: ltsDetail?.name,

            // Creator Info
            created_by: createdBy ? `${createdBy.first_name} ${createdBy.last_name}` : null,

            // Total LOT quantity
            total_lot_quantity: totalLotQuantity,

            // LOT List
            lotDetails
        };
    }).filter(Boolean);


    const totalPages = parseInt(count / limit) + 1;
    return { lotDetails: transformRows, pageNo: page, totalRecords: count , totalPages };
}

exports.getLtsLotsDetail = async (parameters) => {
    const lts_id = parameters?.lts_id ? parameters.lts_id : null;
    
    try {
        const result = await db.LtsDetail.findAll({
            attributes: ["id", "name", "created_at"],
            where: {
                ...(lts_id && { id: lts_id }),
                [db.Sequelize.Op.or]: [
                    { is_deleted: { [db.Sequelize.Op.is]: null } }, // Exclude null values
                    { is_deleted: { [db.Sequelize.Op.is]: false } }, // Exclude false values
                ],
            },
            include: [
                {
                    model: db.SktDetails,
                    as: "sktData",
                    attributes: ["id", "name"],
                    include: [
                        {
                            model: db.SktVarieties,
                            as: "sktvarityData",
                            attributes: ["id", "variety_id", "skt_id"],
                            include: [
                                {
                                    model: db.VarietyDetail,
                                    as: "varityData",
                                    attributes: [
                                        "id",
                                        "amk_number",
                                        "nomenclature",
                                        "qty"
                                    ],
                                },
                                {
                                    model: db.VarietiesLotDetails,
                                    as: "sktVarietyLotData",
                                },
                            ],
                        },
                    ],
                },
                {
                    model: db.User,
                    as: "createdBy",
                    attributes: [
                        "id",
                        "username",
                        "first_name",
                        "last_name",
                    ],
                    include: [
                        {
                            model: db.Role,
                            as: "role_data",
                            attributes: ["id", "role"],
                        },
                    ],
                },
            ]
        });

        return result;

    } catch (error) {
        throw error;
    }
}

exports.createVarietyLots = async (lotsData) => {
    try {
        const result = await db.VarietiesLotDetails.bulkCreate(lotsData);
        return result;
    } catch (error) {
        throw error;
    }
}

exports.updateVarietyLots = async (id, lotsData) => {
    const transaction = await db.sequelize.transaction();
    try {
        const uniqueIds = [...new Set(lotsData.map(lot => lot.skt_variety_id))];
        if (uniqueIds.length !== 1) throw new Error("All LOTs must share same variety ID.");

        const uniqueLotNo = new Set();
        lotsData.forEach(item => {
                if (uniqueLotNo.has(item.lot_number)) {
                    throw new Error(`Duplicate LOT number found: ${item.lot_number}`);
                }
            uniqueLotNo.add(item.lot_number);
        });
        
        // 1. Delete existing lots
        await db.VarietiesLotDetails.destroy({
            where: { skt_variety_id: id },
            transaction
        });

        // 2. Bulk insert updated lots
        const result = await db.VarietiesLotDetails.bulkCreate(lotsData, { transaction });

        await transaction.commit();
        return result;

    } catch (error) {
        await transaction.rollback();
        throw error;
    }
}

exports.deleteVarietyLots = async (id) => {
    try {
        const result = await db.VarietiesLotDetails.destroy({
            where: { skt_variety_id: id },
        });
        return result;
    } catch (error) {
        throw error;
    }
}