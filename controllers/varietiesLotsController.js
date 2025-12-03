const responseHandler = require("../helpers/responseHandler");
const { validationResult } = require("express-validator");
const varietiesLotsService = require("../services/varietiesLotsServices");
const { generateQrCode } = require("../helpers/qrCodeGenerator");
const { getLocalIP } = require("../helpers/ipHandler");

const transformLotDetails = (lotDetails) => {
    const data = lotDetails.map(lts => {
        const transformedData = lts.sktData.map(skt => {
            return {
                skt_id: skt.id,
                name: skt.name,
                sktvarietyData: skt.sktvarityData.map(variety => {
                    return {
                        variety_id: variety.id,
                        amk_number: variety?.varityData[0]?.amk_number,
                        nomenclature: variety?.varityData[0]?.nomenclature,
                        qty: variety?.varityData[0]?.qty,
                        varietyLotData: variety.sktVarietyLotData
                    }
                })
            }
        })
        return {
            lts_id: lts.id,
            lts_name: lts.name,
            created_at: lts.created_at,
            created_by: lts.createdBy?.first_name + " " + lts.createdBy?.last_name,
            sktData: transformedData
        }
    })
    return data;
}

exports.getLotDetailsList = async (req, res) => {
    try {
        const lts_number = req.query?.lts_number ? req.query.lts_number : null;
        const variety_amk_no = req.query?.variety_amk_no ? req.query.variety_amk_no : null;
        const location = req.query?.location ? req.query.location : null;
        const start_date = req.query?.start_date ? req.query.start_date : null;
        const end_date = req.query?.end_date ? req.query.end_date : null;
        const pageNo = req.query?.page ? parseInt(req.query.page) : 1;
        const limit = req.query?.limit ? parseInt(req.query.limit) : 10;

        const lotDetails = await varietiesLotsService.getVarietyLotsList({ pageNo, limit, lts_number, variety_amk_no, location, start_date, end_date });

        responseHandler( req, res, 200, true, "", lotDetails, "LOT details fetched successfully");
    } catch (error) {
        console.log('error: ', error);
        responseHandler(req, res, 500, false, "Server error", { error }, "");
    }
}

exports.getAllLtsList = async (req, res) => {
    try {
        const lotDetails = await varietiesLotsService.getLtsLotsDetail();
        const result = lotDetails
            .filter(lts => {
                // Must have SKT data
                if (!lts.sktData || lts.sktData.length === 0) return false;

                // Loop through each SKT entry
                return lts.sktData.some(skt => {
                    if (!skt.sktvarityData || skt.sktvarityData.length === 0) return false;

                    // Check each variety
                    return skt.sktvarityData.some(variety => {
                        // const varietyQty = variety.varityData?.[0]?.qty ?? 0;
                        const lots = variety.sktVarietyLotData || [];

                        // Sum of lot quantities
                        // const totalLotQty = lots.reduce((sum, lot) => sum + (lot.lot_quantity || 0), 0);

                        // Keep this LTS only if lot is not created
                        return lots.length === 0;
                        // return totalLotQty < varietyQty;
                    });
                });
            })
            .map(lts => ({
                id: lts.id,
                name: lts.name
            }));

        responseHandler(req, res, 200, true, "", result, "All LTS fetched successfully");
    } catch (error) {
        console.log('error: ', error);
        responseHandler(req, res, 500, false, "Server error", { error }, "");
    }
}

exports.getLtsDetailsById = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return responseHandler(req, res, 400, false, "Validation errors", { errors: errors.array() }, "");
        }

        const lts_id = req.params.lts_id;

        const lotDetails = await varietiesLotsService.getLtsLotsDetail({ lts_id });

        const result = transformLotDetails(lotDetails);

        const response = result.length > 0 ?
        result[0]
        : {
            lts_id: null,
            lts_name: null,
            created_at: null,
            created_by: null,
            sktData: []
        };

        responseHandler( req, res, 200, true, "", response, "LOT details fetched successfully");
    } catch (error) {
        console.log('error: ', error);
        responseHandler(req, res, 500, false, "Server error", { error }, "");
    }
}

exports.createVarietyLots = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return responseHandler(req, res, 400, false, "Validation errors", { errors: errors.array() }, "");
        }
        const url = `http://${getLocalIP()}:${process.env.PORT || 8080}/` || process.env.BASE_URL;
        let lotsData = req.body;
        lotsData = lotsData.map(lot => {
            return {
                ...lot,
                lot_quantity: parseInt(lot.lot_quantity),
                qr_reference_id: `${url}?lot_number=${lot.lot_number}&qty=${lot.lot_quantity}&qr_code=${generateQrCode()}`
            }
        })
        const result = await varietiesLotsService.createVarietyLots(lotsData);
        responseHandler(req, res, 200, true, "", result, "Variety lots created successfully");
    } catch (error) {
        console.log('error: ', error);
        responseHandler(req, res, 500, false, "Server error", { error }, "");
    }
}

exports.updateVarietyLots = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return responseHandler(req, res, 400, false, "Validation errors", { errors: errors.array() }, "");
        }
        const id = req.params.id;
        const url = `http://${getLocalIP()}:${process.env.PORT || 8080}/` || process.env.BASE_URL;
        let lotsData = req.body;
        lotsData = lotsData.map(lot => {
            return {
                ...lot,
                lot_quantity: parseInt(lot.lot_quantity),
                qr_reference_id: `${url}?lot_number=${lot.lot_number}&qty=${lot.lot_quantity}&qr_code=${generateQrCode()}`
            }
        })
        const result = await varietiesLotsService.updateVarietyLots(id, lotsData);
        responseHandler(req, res, 200, true, "", result, "Variety lots updated successfully");
    } catch (error) {
        responseHandler(req, res, 500, false, "Server error", { error }, "");
    }
}

exports.deleteVarietyLots = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return responseHandler(req, res, 400, false, "Validation errors", { errors: errors.array() }, "");
        }
        const id = req.params.id;
        const result = await varietiesLotsService.deleteVarietyLots(id);
        responseHandler(req, res, 200, true, "", result, "Variety lots deleted successfully");
    } catch (error) {
        responseHandler(req, res, 500, false, "Server error", { error }, "");
    }
}