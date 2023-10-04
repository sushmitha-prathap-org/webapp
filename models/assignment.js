import { Sequelize, DataTypes } from "sequelize";
import sequelize from "../database.js";
import User from "./user.js";

const Assignment = sequelize.define(
  "Assignment",
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    points: {
      type: DataTypes.INTEGER,
      validate: {
        min: 1,
        max: 100,
        notEmpty: true,
      },
    },
    num_of_attemps: {
      type: DataTypes.INTEGER,
      validate: {
        min: 1,
        max: 100,
        notEmpty: true,
      },
    },
    deadline: {
      type: DataTypes.DATE, //enable timestamp
      validate: {
        notEmpty: true,
      },
    },
    // assignment_created: {
    //   allowNull: false,
    //   type: DataTypes.DATE,
    //   defaultValue: DataTypes.NOW,
    // },
    // assignment_updated: {
    //   allowNull: false,
    //   type: DataTypes.DATE,
    //   defaultValue: DataTypes.NOW,
    // },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false, // This field should not be null
    },
  },
  {
    modelName: "assignments", // We need to choose the model name
    updatedAt: "assignment_updated",
    createdAt: "assignment_created",
  }
);

console.log("in assignment model", Assignment === sequelize.models.Assignment); // true

// `sequelize.define` also returns the model
console.log(Assignment === sequelize.models.Assignment); // true

User.hasMany(Assignment, { foreignKey: "userId" });
Assignment.belongsTo(User, { foreignKey: "userId" });

Assignment.sync().then(() => {
  console.log("assignment table created");
});

export default Assignment;
