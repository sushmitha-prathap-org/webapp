import { Sequelize } from "sequelize";

const username = process.env.dbUser;
const pass = process.env.dbPassword;
const host = process.env.dbHost;
const db = process.env.database;

const sequelize = new Sequelize(db, username, pass, {
  host: host,
  dialect: "mysql",
  logging: false,
});

export default sequelize;
