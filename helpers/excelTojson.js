
export const excelTojson = (row, storeType) => {
    let rowData = {};

    if (storeType === "techStore" || storeType === "gscStore" || storeType === "mtStore") {
        rowData["sr_no"] = row.getCell(1).value || '';
        rowData["sec"] = row.getCell(2).value || '';
        rowData["amk_number"] = row.getCell(3).value || '';
        rowData["nomenclature"] = row.getCell(4).value || '';
        rowData["a_u"] = row.getCell(5).value || '';
        rowData["inv_of_store_type"] = storeType;
        rowData["total_quantity"] = row.getCell(6).value || '';
        rowData["mmf"] = row.getCell(7).value || '';
        rowData["remarks"] = row.getCell(8).value || '';
        rowData['is_deleted'] = false
    } else if (storeType === "ammunition") {
        rowData["amk_number"] = row.getCell(1).value || '';
        rowData["location"] = row.getCell(2).value || '';
        rowData["total_quantity"] = row.getCell(3).value || '';
    }
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
    // Prepare transformed data
    const transformedData = data.map(row => ({ ...row, sheet_id: excelFileRecord.id }));

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
            console.log(`Processing batch ${i+1}/${batches.length} (${batch.length} records)...`);

            // Process each record in the batch
            const batchResults = await Promise.all(batch.map(async (record) => {
                try {
                    // Find or create record based on amk_number
                    const [instance, created] = await db.ManageAmkQuantity.findOrCreate({
                        where: { amk_number: record.amk_number },
                        defaults: record, // All fields for new records
                        transaction
                    });

                    // Update specific fields if record already exists
                    if (!created) {
                        await instance.update({
                            total_quantity: record.total_quantity,
                            sheet_id: record.sheet_id
                            // Add other fields to update here as needed
                        }, { transaction });
                    }

                    successCount++;
                    return { success: true, instance, created };
                } catch (err) {
                    errorCount++;
                    console.error(`Error processing record ${record.amk_number}:`, err.message);
                    return { success: false, error: err.message, record };
                }
            }));

            // Commit transaction if all operations in the batch succeeded
            await transaction.commit();
            results.push(...batchResults);

            console.log(`Batch ${i+1} completed: ${batchResults.filter(r => r.success).length} successful, ${batchResults.filter(r => !r.success).length} failed`);
        } catch (error) {
            // Rollback transaction if any operation in the batch failed
            await transaction.rollback();
            console.error(`Batch ${i+1} failed with error:`, error.message);
            errorCount += batch.length;
        }
    }

    // Return summary
    return {
        totalProcessed: transformedData.length,
        successCount,
        errorCount,
        results: results.filter(r => r.success).map(r => r.instance)
    };
}


export const validateExcelData = (jsonData, storeType) => {
    const errors = [];
    
    jsonData.forEach((row, index) => {
        const rowNumber = index + 2; // Assuming the first row is the header
        if (storeType === "techStore" || storeType === "gscStore" || storeType === "mtStore") {
            if (!row.amk_number || row.amk_number.toString().trim() === '') {
                errors.push(`AMK Number is required at row ${rowNumber}`);
            }
            if (!row.sec || row.sec.toString().trim() === '') {
                errors.push(`Section is required at row ${rowNumber}`);
            }
            if (!row.nomenclature || row.nomenclature.toString().trim() === '') {
                errors.push(`Nomenclature is required at row ${rowNumber}`);
            }
            if (!row.a_u || row.a_u.toString().trim() === '') {
                errors.push(`A/U is required at row ${rowNumber}`);
            }
            if (!row.total_quantity || row.total_quantity.toString().trim() === '') {
                errors.push(`Total Quantity is required at row ${rowNumber}`);
            }
        } else if (storeType === "ammunition") {
            if (!row.amk_number || row.amk_number.toString().trim() === '') {
                errors.push(`AMK Number is required at row ${rowNumber}`);
            }
            if (!row.location || row.location.toString().trim() === '') {
                errors.push(`Location is required at row ${rowNumber}`);
            }
            if (!row.total_quantity || row.total_quantity.toString().trim() === '') {
                errors.push(`Total Quantity is required at row ${rowNumber}`);
            }
        }
    });
    return errors;
}