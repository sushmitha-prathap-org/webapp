import { DataTypes } from "sequelize";
import sequelize from "../database/database.js";
import Assignment from "./assignment.js";

const Submission = sequelize.define(
  "Submission",
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    submission_url: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    assignment_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    // submission_date: {
    //   type: DataTypes.DATE, //enable timestamp
    //   validate: {
    //     notEmpty: true,
    //   },
    // },
  },
  {
    modelName: "submission", // We need to choose the model name
    updatedAt: "submission_updated",
    createdAt: "submission_date",
  }
);

console.log("in submission model", Submission === sequelize.models.Submission); // true

Assignment.hasMany(Submission, {
  foreignKey: "assignment_id",
  onDelete: "cascade",
});
Submission.belongsTo(Assignment, { foreignKey: "assignment_id" });

// Submission.sync().then(() => {
//   console.log("submission table created");
// });

export default Submission;
