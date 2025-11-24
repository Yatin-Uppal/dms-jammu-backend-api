"use strict";

const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");
const { spawn } = require("child_process");
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || "development";
const config = require(__dirname + "/../config/config.js")[env];

const db = {};
let sequelize;

// Helper to run migrations/seeders
function runSequelizeCommand(args) {
  return new Promise((resolve, reject) => {
    const child = spawn("npx", ["sequelize-cli", ...args], { stdio: "inherit" });
    child.on("close", (code) => (code === 0 ? resolve() : reject(code)));
  });
}

// Initialize DB
db.initialize = async () => {
  try {
    const serverSequelize = new Sequelize({
      username: config.username,
      password: config.password,
      host: config.host,
      port: config.port,
      dialect: config.dialect,
      logging: false,
    });

    await serverSequelize.authenticate();

    // Create DB if not exists
    const [result] = await serverSequelize.query(
      `CREATE DATABASE IF NOT EXISTS \`${config.database}\` 
       CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;`
    );

    // Reconnect selecting database
    sequelize = new Sequelize(
      config.database,
      config.username,
      config.password,
      { ...config, logging: false }
    );

    await sequelize.authenticate();

    // Run migrations, seeders only if DB was empty
    if (result.warningStatus === 0) {
      await runSequelizeCommand(["db:migrate"]);
      await runSequelizeCommand(["db:seed:all"]);
    }

    // Load models after sequelize is ready
    fs.readdirSync(__dirname)
      .filter((file) => file !== basename && file.endsWith(".js"))
      .forEach((file) => {
        const model = require(path.join(__dirname, file))(
          sequelize,
          Sequelize.DataTypes
        );
        db[model.name] = model;
      });

    Object.keys(db).forEach((modelName) => {
      if (db[modelName].associate) db[modelName].associate(db);
    });

    db.sequelize = sequelize;
    db.Sequelize = Sequelize;

    console.log("Database Connected Successfully.");

  } catch (err) {
    console.error("Sequelize initialization failed:", err);
    throw err;
  }
};

module.exports = db;
