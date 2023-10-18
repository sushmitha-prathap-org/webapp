import express from "express";
import cors from "cors";
import sequelize from "./database.js";
import fs from "fs";
import csvParser from "csv-parser";
import User from "./models/user.js";
import bcrypt from "bcrypt";
import routes from "./routes/index.js";

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

async function startServer() {
  try {
    // Synchronize models with the database
    await sequelize.sync({ force: true }); // Set force to true to recreate tables (use with caution)

    // Start your server here
  } catch (error) {
    console.error("Error synchronizing database:", error);
  }
}

startServer();

routes(app);

const port = 9000;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

export default app;
