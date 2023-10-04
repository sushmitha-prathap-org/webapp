import { Sequelize } from "sequelize";

const sequelize = new Sequelize("assignment3", "root", "1998@Pupss", {
  host: "localhost",
  dialect: "mysql",
});

export default sequelize;
