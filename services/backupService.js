
const path = require('path');
const { exec } = require('child_process');
exports.backupDatabase = () => {
    const backupName = `backup_${Math.random()}.sql`;
    const backupPath = path.join(__dirname, '../public', backupName);

    const command = `mysqldump -u ${process.env.DB_USERNAME} -p${process.env.DB_PASSWORD} ${process.env.DB_DATABASE_DEVELOPMENT} > ${backupPath}`;

    return new Promise((resolve, reject) => {
        exec(command, (error) => { // exec function from the child_process module. The exec function is used to run shell commands.
            if (error) {
                reject(error);
            } else {
                resolve(backupName);
            }
        });
    });
};