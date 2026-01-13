const responseHandler = require("../helpers/responseHandler");
const { validationResult } = require("express-validator");
const varietiesLotsService = require("../services/varietiesLotsServices");
const { generateQrCode } = require("../helpers/qrCodeGenerator");



const getLotDetailsList = async (req, res) => {
    try {
        const lts_name = req.query?.lts_name ? req.query.lts_name : null;
        const variety_amk_no = req.query?.variety_amk_no ? req.query.variety_amk_no : null;
        const location = req.query?.location ? req.query.location : null;
        const start_date = req.query?.start_date ? req.query.start_date : null;
        const end_date = req.query?.end_date ? req.query.end_date : null;
        const pageNo = req.query?.page ? parseInt(req.query.page) : 1;
        const limit = req.query?.limit ? parseInt(req.query.limit) : 10;

        const lotDetails = await varietiesLotsService.getVarietyLotsList({ pageNo, limit, lts_name, variety_amk_no, location, start_date, end_date });

        responseHandler( req, res, 200, true, "", lotDetails, "LOT details fetched successfully");
    } catch (error) {
        console.log('error: ', error);
        responseHandler(req, res, 500, false, "Server error", { error }, "");
    }
}

const getAllLtsList = async (req, res) => {
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

const getAllGeneratedLtsList = async (req, res) => {
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
                        return lots.length !== 0;
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

const getLtsDetailsById = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return responseHandler(req, res, 400, false, "Validation errors", { errors: errors.array() }, "");
        }

        const lts_id = req.query.lts_id;
        if (!lts_id) {
            return responseHandler(req, res, 400, false, "LTS id is required", {}, "");
        }
        const variety_id = req.query?.variety_id ? req.query.variety_id : null;

        const lotDetails = await varietiesLotsService.getLtsLotsDetail({ lts_id, variety_id });

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

const createVarietyLots = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return responseHandler(req, res, 400, false, "Validation errors", { errors: errors.array() }, "");
        }
        let lotsData = req.body;
        lotsData = lotsData.map(lot => {
            return {
                ...lot,
                lot_quantity: parseInt(lot.lot_quantity),
                qr_reference_id: `?lot_number=${lot.lot_number}&qty=${lot.lot_quantity}&qr_code=${generateQrCode()}`
            }
        })
        const result = await varietiesLotsService.createVarietyLots(lotsData);
        responseHandler(req, res, 200, true, "", result, "Variety lots created successfully");
    } catch (error) {
        console.log('error: ', error);
        responseHandler(req, res, 500, false, "Server error", { error }, "");
    }
}

const updateVarietyLots = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return responseHandler(req, res, 400, false, "Validation errors", { errors: errors.array() }, "");
        }
        const id = req.params.id;
        let lotsData = req.body;
        lotsData = lotsData.map(lot => {
            return {
                ...lot,
                lot_quantity: parseInt(lot.lot_quantity),
                qr_reference_id: `?lot_number=${lot.lot_number}&qty=${lot.lot_quantity}&qr_code=${generateQrCode()}`
            }
        })
        const result = await varietiesLotsService.updateVarietyLots(id, lotsData);
        responseHandler(req, res, 200, true, "", result, "Variety lots updated successfully");
    } catch (error) {
        responseHandler(req, res, 500, false, "Server error", { error }, "");
    }
}

const deleteVarietyLots = async (req, res) => {
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

module.exports = {
    transformLotDetails,
    getLotDetailsList,
    getAllLtsList,
    getAllGeneratedLtsList,
    getLtsDetailsById,
    createVarietyLots,
    updateVarietyLots,
    deleteVarietyLots
};