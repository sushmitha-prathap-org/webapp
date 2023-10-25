import { Sequelize } from "sequelize";

const sequelize = new Sequelize("assignment3", "root", "1998@Pupss", {
  host: "127.0.0.1",
  dialect: "mysql",
  logging: false
});

export default sequelize;
