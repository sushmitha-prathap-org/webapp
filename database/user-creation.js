import fs from "fs";
import csvParser from "csv-parser";
import User from "../models/user.js";
import bcrypt from "bcrypt";

// Read and parse the CSV file
const createUser = () => {
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
          // console.log("hashed pa", hashedPassword);

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
};

export default createUser;
