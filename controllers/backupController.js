const db = require("../models");
const responseHandler = require("../helpers/responseHandler");
const { Op } = require("sequelize");
const backupService = require("../services/backupService");
const { getLocalIP } = require("../helpers/ipHandler");
const path = require('path');
const fs = require("fs")

exports.createBackup = async (req, res) => {
    try {

        const ipAddress = getLocalIP();        
        const backupName = await backupService.backupDatabase()
        await db.BackupDetails.create({
            name: backupName,
            backup_date: new Date(),
        });
        const URL = `http://${ipAddress}:8080/` || process.env.BASE_URL;
        const dumpFile = `${URL}${backupName}`;
        const backupPath = path.join(__dirname, '../public', backupName);
        setTimeout(() => {
            if (fs.existsSync(backupPath)) {
                fs.unlinkSync(backupPath);
            }
            // Delete the file
        }, 10 * 1000);
        return responseHandler(req,res, 200, true, "", { dumpFile }, "Backup created successfully");

    } catch (error) {
        responseHandler(req,res, 500, false, "Server error", { error }, "");
    }
}


exports.getBackupList = async (req, res) => {
    try {
        const limit = req.query.limit ? +req.query.limit : 10;
        const page = req.query.page ? +req.query.page : 1;
        const offset = page > 1 ? (page - 1) * limit : 0;
        const backupList = await db.BackupDetails.findAll({
            offset,
            limit,
            order: [["created_at", "DESC"]],
        })
        totalCount = await db.BackupDetails.count();
        const totalPage = parseInt(totalCount / limit) + 1;
        return responseHandler(req,
            res,
            200,
            true,
            "",
            { backupList, page, limit, totalCount, totalPage },
            "Users list fecthed successfully")
    } catch (error) {
        responseHandler(req,res, 500, false, "Server error", { error }, "");
    }
}