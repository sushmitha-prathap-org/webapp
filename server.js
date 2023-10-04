import express from "express";
import cors from "cors";
import sequelize from "./database.js";
import fs from "fs";
import csvParser from "csv-parser";
import User from "./models/user.js";
import bcrypt from "bcrypt";
import routes from "./routes/index.js";
// import { db } from "./models/index.js";

// const db = require("./models");

const app = express();

app.use(express.json());
app.use(express.urlencoded());
app.use(cors());

// Read and parse the CSV file
fs.createReadStream("./opt/users.csv")
  .pipe(csvParser())
  .on("data", async (row) => {
    // console.log("data", row, row.firstName);
    try {
      // Check if a user with the same username or email exists
      const existingUser = await User.findOne({
        where: {
          firstName: row.firstName,
          // [sequelize.or]: [
          //   { firstName: row.firstName },
          //   { lastName: row.lastName },
          // ],
        },
      });

      // console.log("is existing", existingUser);

      if (!existingUser) {
        // Create a new user if it doesn't exist
        const hashedPassword = await bcrypt.hash(row.password, 1); // Use 1 rounds of hashing
        console.log("hashed pa", hashedPassword);

        await User.create({
          firstName: row.firstName,
          lastName: row.lastName,
          email: row.email,
          password: hashedPassword,
        });
      }
    } catch (error) {
      console.error("Error creating/updating user:", error);
    }
  })
  .on("end", () => {
    console.log("CSV data processed.");
  });

// Middleware to set cache-control header to 'no-cache'
app.use("/healthz", (req, res, next) => {
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Content-Length", "0");

  // if (req.method !== "GET" || req.headers["content-length"] !== "1") {
  if (req.method !== "GET") {
    return res.status(405).send("Method Not Allowed");
  }
  if (
    Object.keys(req.query).length !== 0 ||
    Object.keys(req.body).length !== 0
  ) {
    return res.status(400).send("Bad Request");
  }
  next();
});

app.get("/healthz", async (req, res) => {
  res.setHeader("Cache-Control", "no-cache");
  try {
    const isDatabaseConnected = await checkDatabaseConnection();
    console.log("is", isDatabaseConnected);

    if (isDatabaseConnected) {
      res.status(200).end(); // to ensure no payload is sent
    } else {
      res.status(503).end(); // HTTP 503 Service Unavailable
    }
  } catch (error) {
    console.error("Error in health check:", error);
    res.status(503).end(); // Handle any errors as service unavailable and to ensure no payload is sent
  }
});

async function checkDatabaseConnection() {
  return new Promise(async (resolve, reject) => {
    try {
      await sequelize.authenticate();
      console.log("Connection has been established successfully.");
      resolve(true);
    } catch (error) {
      console.error("Unable to connect to the database:", error);
      reject(error);
    }
  });
}

// async function startServer() {
//   try {
//     // Synchronize models with the database
//     await sequelize.sync({ force: false }); // Set force to true to recreate tables (use with caution)

//     // Start your server here
//   } catch (error) {
//     console.error("Error synchronizing database:", error);
//   }
// }

// startServer();

routes(app);

const port = 9000;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
