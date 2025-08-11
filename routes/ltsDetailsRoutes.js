// routes/ltsDetailsRoutes.js

const express = require("express");
const router = express.Router();
const { body, check } = require("express-validator");
const ltsDetailsController = require('../controllers/ltsDetailsController');
const authMiddleware = require('../middleware/authMiddleware');

// create lts API 
router.post('/lts', authMiddleware.verifyAccessToken,[
    body('ltsNo')
    .notEmpty()
    .withMessage('Load Tally Sheet Name is required')
    .isString(),
    check('skts')
        .notEmpty()
        .withMessage('At least one SKT is required')
        .isArray({ min: 1 })
        .withMessage('At least one SKT is required')
        .custom((skts) => {
            for (const skt of skts) {
                if (!skt.skt_name) {
                    throw new Error('SKT Name is required in each SKT');
                }
                if (!skt.varieties || !Array.isArray(skt.varieties) || skt.varieties.length === 0) {
                    throw new Error('At least one Variety is required in each SKT');
                }
            }
            return true;
        }),
],
     ltsDetailsController.createLTS);

// get all lts data
router.get('/lts-details', authMiddleware.verifyAccessToken, ltsDetailsController.getLTSDetails);

// get lts by id
router.get('/lts/:ltsId/details', authMiddleware.verifyAccessToken, ltsDetailsController.getLTSDetailsById);

// update lts data
router.put('/lts/:lts_Id', authMiddleware.verifyAccessToken,[
    body('ltsNo')
    .notEmpty()
    .withMessage('Load Tally Sheet Name is required')
    .isString(),
    check('skts')
        .notEmpty()
        .withMessage('At least one SKT is required')
        .isArray({ min: 1 })
        .withMessage('At least one SKT is required')
        .custom((skts) => {
            for (const skt of skts) {
                if (!skt.skt_name) {
                    throw new Error('SKT Name is required in each SKT');
                }
                if (!skt.varieties || !Array.isArray(skt.varieties) || skt.varieties.length === 0) {
                    throw new Error('At least one Variety is required in each SKT');
                }
            }
            return true;
        }),
],ltsDetailsController.updateLTS);

    // delete lts data
router.delete('/lts/:ltsId', authMiddleware.verifyAccessToken, ltsDetailsController.deleteLTS);

// Add a new route to get LTS data grouped by load_telly_sheet_lts_number
router.get('/lts/details', authMiddleware.verifyAccessToken, ltsDetailsController.getLTSDetailsGrouped);


module.exports = router;
