import express from "express";
import sequelize from "../database/database.js";
import logger from "../logger.js";

const router = express.Router();

let count = 0;

const checkDbMiddleware = (req, res, next) => {
  console.log("in healthz middleware");
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
};

const checkDatabaseConnection = async () => {
  return new Promise(async (resolve, reject) => {
    try {
      await sequelize.authenticate();
      console.log("Connection has been established successfully.");
      logger.info("Connection has been established successfully.");
      resolve(true);
    } catch (error) {
      console.error("Unable to connect to the database:", error);
      logger.error("Unable to connect to the database");
      reject(error);
    }
  });
};

router
  .route("/healthz")
  .all(checkDbMiddleware)
  .get(async (req, res) => {
    res.setHeader("Cache-Control", "no-cache");
    logger.info(`healthz API count:${count + 1}`);
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

export default router;
