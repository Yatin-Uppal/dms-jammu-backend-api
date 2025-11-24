const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

exports.backupDatabase = ({
  host = process.env.DB_HOST || 'localhost',
  user = process.env.DB_USERNAME || 'root',
  password = process.env.DB_PASSWORD || 'root',
  database = process.env.DB_DATABASE_DEVELOPMENT || 'dms',
  backupDir = path.join(__dirname, '../public')
} = {}) => {
  const backupName = `backup_${Math.random()}.sql`;
  const backupPath = path.join(backupDir, backupName);

  // If mysqldump is not on PATH, set MYSQLDUMP_PATH env var to full exe path.
  const mysqldump = process.env.MYSQLDUMP_PATH || 'mysqldump';

  // Build args
  const args = [
    `-h`, host,
    `-u`, user,
    `--routines`,
    `--triggers`,
    `--events`,
    database
  ];
  // If you must pass the password on the command line:
  if (password) args.splice(2, 0, `--password=${password}`);

  fs.mkdirSync(backupDir, { recursive: true });
  const out = fs.createWriteStream(backupPath);

  return new Promise((resolve, reject) => {
    const proc = spawn(mysqldump, args, { windowsHide: true });

    proc.stdout.pipe(out);

    let stderr = '';
    proc.stderr.on('data', d => stderr += d.toString());

    proc.on('error', err => {
      // e.g., spawn ENOENT => mysqldump not found
      reject({ message: 'Failed to start mysqldump', error: err });
    });

    proc.on('close', code => {
      out.close();
      if (code === 0) {
        resolve(backupName);
      } else {
        reject({ message: `mysqldump exited with code ${code}`, stderr });
      }
    });
  });
};