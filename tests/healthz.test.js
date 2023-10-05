import chai from "chai";
import chaiHttp from "chai-http";
import { Sequelize } from "sequelize";
import app from "../server.js";
const { expect } = chai;

chai.use(chaiHttp);

const sequelize = new Sequelize("assignment3", "root", "1998@Pupss", {
  dialect: "mariadb",
  host: "localhost",
  port: 3306,
});

describe("Health Check Endpoint", () => {
  before(async () => {
    // Connect to the test database
    await sequelize.authenticate();
    console.log("Connected to test database");
  });

  //   after(async () => {
  //     // Close the database connection after tests
  //     await sequelize.close();
  //     console.log("Closed test database connection");
  //   });

  it("should return 200 OK if the database is connected", async () => {
    const res = await chai.request(app).get("/healthz");
    expect(res).to.have.status(200);
  });

  //   it("should return 503 Service Unavailable if the database connection fails", async () => {
  //     // Mock the Sequelize.authenticate method to simulate a database connection failure
  //     const originalAuthenticate = sequelize.authenticate;
  //     sequelize.authenticate = async () => {
  //       throw new Error("Database connection failed");
  //     };
});
