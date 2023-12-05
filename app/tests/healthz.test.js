// import chai from "chai";
// import chaiHttp from "chai-http";
// import sequelize from "../database/database.js";
// import app from "../server.js";
// const { expect } = chai;

// chai.use(chaiHttp);

// describe("Health Check Endpoint", () => {
//   before(async () => {
//     // Connect to the test database
//     await sequelize.authenticate();
//     console.log("Connected to test database");
//   });

//   // after(async () => {
//   //   // Close the database connection after tests
//   //   await sequelize.close();
//   //   console.log("Closed test database connection");
//   // });

//   it("should return 200 OK if the database is connected", async () => {
//     const res = await chai.request(app).get("/healthCheck/healthz");
//     expect(res).to.have.status(200);
//   });

// });

import request from "supertest";
import app from "../server.js";

beforeAll((done) => {
  done();
});

describe("GET /healthz", () => {
  it("should return 200", async () => {
    const res = await request(app).get("/healthChecks/healthz");
    expect(res.statusCode).toBe(200);
  });
});

afterAll((done) => {
  done();
});
