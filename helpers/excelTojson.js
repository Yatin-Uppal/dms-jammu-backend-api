
import { yymmddToDate } from "../services/timeFormatServices.js";
import { generateQrCode } from "./qrCodeGenerator.js";

// Convert Excel row to JSON (unused)
export const excelTojson = (row) => {
    let rowData = {};
    rowData["amk_number"] = row.getCell(1).value || '';
    rowData["nomenclature"] = row.getCell(2)?.value || '';
    rowData["location"] = row.getCell(3).value || '';
    rowData["condition"] = row.getCell(4)?.value || '';
    rowData["total_quantity"] = row.getCell(5).value || '';

    let lot_numbers = [];
    let colIndex = 6;
    while (true) {
        const lotValue = row.getCell(colIndex)?.value;
        if (!lotValue || lotValue.toString().trim() === '') {
            break;
        }
        lot_numbers.push(lotValue);
        colIndex++;
    }
    rowData["lot_numbers"] = lot_numbers;

    return rowData;
}

/**
 * Process records in batches with transaction support
 * @param {Array} data - Array of records to process
 * @param {Object} excelFileRecord - Contains the ID to attach to each record
 * @param {Object} db - Sequelize database instance
 * @param {Number} batchSize - Number of records to process in each batch (optional)
 */
export async function processRecordsInBatches(data, excelFileRecord, db, batchSize = 50) {
    // Group data by amk and loc
    const groupedDataMap = new Map();

    data.forEach(row => {
        const key = `${row.amk}_${row.loc}`;
        if (!groupedDataMap.has(key)) {
            groupedDataMap.set(key, {
                amk: row.amk,
                loc: row.loc,
                condition: row.condition || '',
                total_quantity: 0,
                lot_details: [],
                sheet_id: excelFileRecord.id
            });
        }
        const group = groupedDataMap.get(key);
        const qty_bal = Number(row.qty_bal) || 0;
        group.total_quantity += qty_bal;
        group.lot_details.push({
            crity_lot: row.crity_lot,
            qty_bal: qty_bal
        });
    });

    const transformedData = Array.from(groupedDataMap.values());

    // Create batches
    const batches = [];
    for (let i = 0; i < transformedData.length; i += batchSize) {
        batches.push(transformedData.slice(i, i + batchSize));
    }

    const results = [];
    let successCount = 0;
    let errorCount = 0;

    // Process each batch with its own transaction
    for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];
        const transaction = await db.sequelize.transaction();

        try {
            // Process each record in the batch
            const batchResults = await Promise.all(batch.map(async (record) => {
                try {
                    const amkData = {
                        amk_number: record.amk,
                        location: record.loc,
                        condition: record.condition,
                        total_quantity: record.total_quantity,
                        sheet_id: record.sheet_id
                    };

                    // Find or create record based on amk_number AND location
                    const [instance, created] = await db.ManageAmkQuantity.findOrCreate({
                        where: {
                            amk_number: record.amk,
                            location: record.loc,
                            [db.Sequelize.Op.or]: [
                                { is_deleted: { [db.Sequelize.Op.is]: null } }, // Exclude null values
                                { is_deleted: { [db.Sequelize.Op.is]: false } }, // Exclude false values
                            ],
                        },
                        defaults: amkData,
                        transaction
                    });

                    // Update if record already exists
                    if (!created) {
                        await instance.update({
                            total_quantity: Number(instance.total_quantity) + Number(record.total_quantity),
                            condition: record.condition,
                            sheet_id: record.sheet_id
                        }, { transaction });

                        // update existing lot details(add qty_bal with existing lot_quantity in db, update qr_code) to refresh them
                        for (const lot of record.lot_details) {
                            const [lotInstance, lotCreated] = await db.AmkLotDetails.findOrCreate({
                                where: { amk_id: instance.id, lot_number: lot.crity_lot },
                                defaults: {
                                    amk_id: instance.id,
                                    lot_number: lot.crity_lot,
                                    lot_quantity: lot.qty_bal,
                                    qr_code: generateQrCode(record.loc, record.amk, lot.crity_lot, lot.qty_bal),
                                    manufacture_date: yymmddToDate(lot.crity_lot?.split("/")[0]),
                                    
                                },
                                transaction
                            });
                            if (!lotCreated) {
                                const updatedQuantity = Number(lotInstance.lot_quantity) + Number(lot.qty_bal);
                                await lotInstance.update({
                                    lot_quantity: updatedQuantity,
                                    qr_code: generateQrCode(record.loc, record.amk, lot.crity_lot, updatedQuantity),
                                }, { transaction });
                            }
                        }
                    } else {
                        const lotDetails = record.lot_details.map((lot) => ({
                            amk_id: instance.id,
                            lot_number: lot.crity_lot,
                            lot_quantity: lot.qty_bal,
                            qr_code: generateQrCode(record.loc, record.amk, lot.crity_lot, lot.qty_bal),
                            manufacture_date: yymmddToDate(lot.crity_lot?.split("/")[0]),
                        }));
    
                        await db.AmkLotDetails.bulkCreate(lotDetails, { transaction });
                    }

                    successCount++;
                    return { success: true, instance, created };
                } catch (err) {
                    errorCount++;
                    console.error(`Error processing record ${record.amk}:`, err.message);
                    return { success: false, error: err.message, record };
                }
            }));

            // Commit transaction if all operations in the batch succeeded
            await transaction.commit();
            results.push(...batchResults);

        } catch (error) {
            // Rollback transaction if any operation in the batch failed
            await transaction.rollback();
            console.error(`Batch ${i + 1} failed with error:`, error.message);
            errorCount += batch.length;
        }
    }

    // Return summary
    return {
        totalProcessed: data.length, // Total original rows
        groupedCount: transformedData.length, // Total unique AMK/Loc combinations
        successCount,
        errorCount,
        results: results.filter(r => r.success).map(r => r.instance)
    };
}


export const validateExcelData = (headerRow, jsonData) => {
    const errors = [];
    const requiredHeaders = ["amk", "loc", "crity_lot", "qty_bal", "condition"];
    requiredHeaders.forEach((header) => {
        if (!headerRow.includes(header)) {
            errors.push(`Please upload correct file format.`);
            return;
        }
    });

    if (errors.length > 0) {
        return errors;
    }

    jsonData.forEach((row, index) => {
        const rowNumber = index + 2; // Assuming the first row is the header
        if (!row.amk || row.amk.toString().trim() === '') {
            errors.push(`AMK Number is required at row ${rowNumber}`);
        }
        if (!row.loc || row.loc.toString().trim() === '') {
            errors.push(`Location is required at row ${rowNumber}`);
        }
        if (!row.qty_bal || row.qty_bal.toString().trim() === '') {
            errors.push(`Total Quantity is required at row ${rowNumber}`);
        }
        if (!row.crity_lot || row.crity_lot.toString().trim() === '') {
            errors.push(`Lot Number is required at row ${rowNumber}`);
        }
        if (row.crity_lot && !/^\d{6}\/.*$/.test(row.crity_lot)) {
            errors.push(`Invalid Lot Number at row ${rowNumber}`);
        }
    });
    return errors;
}  