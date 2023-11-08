import express from "express";
import cors from "cors";
import sequelize from "./database/database.js";
import * as routes from "./routes/index.js";
import createUser from "./database/user-creation.js";
import logger from "./logger.js";

try {
  let sqlSync = async () => {
    await sequelize.sync();
  };
  await sqlSync();
  createUser();
} catch (err) {
  console.log("Bootstrap error", err);
  logger.error("Bootstrap error");
}

// const startServer = async () => {
//   try {
//     // Synchronize models with the database
//     await sequelize.sync({ force: false }); // Set force to true to recreate tables (use with caution)

//     // Start your server here
//   } catch (error) {
//     console.error("Error synchronizing database:", error);
//   }
// };

// startServer();

const app = express();

app.use(express.json());
app.use(express.urlencoded());
app.use(cors());

routes.healthCheck(app);
routes.assignment(app);

const port = 9000;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  logger.info(`Server running on port ${port}`);
});

export default app;
