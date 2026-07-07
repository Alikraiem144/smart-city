import { Sequelize } from "sequelize";

export const sequelize = new Sequelize(
  process.env.DB_NAME || "crowd_mapping",
  process.env.DB_USER || "postgres",
  process.env.DB_PASSWORD || "manela14031818",
  {
    host: process.env.DB_HOST || "localhost",
    dialect: "postgres",
    port: Number(process.env.DB_PORT) || 5432,
    logging: false,
  }
);