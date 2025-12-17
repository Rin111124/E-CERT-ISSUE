import { Sequelize } from "sequelize";
import { config } from "./config.js";

// Use Postgres when DATABASE_URL is provided; fallback to SQLite for local dev
let sequelizeInstance;
if (config.databaseUrl) {
  sequelizeInstance = new Sequelize(config.databaseUrl, {
    dialect: "postgres",
    logging: false,
  });
} else {
  sequelizeInstance = new Sequelize({
    dialect: "sqlite",
    storage: "./data.sqlite",
    logging: false,
  });
}

export const sequelize = sequelizeInstance;
