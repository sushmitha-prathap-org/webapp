import express, { response } from "express";
import basicAuth from "basic-auth";
import bcrypt from "bcrypt";
import sequelize from "../database/database.js";

import * as assignmentController from "../controller/assignments.js";
import User from "../models/user.js";
import Assignment from "../models/assignment.js";
import logger from "../logger.js";
import Lynx from "lynx";

const assignments = new Lynx("localhost", 8125);

const router = express.Router();

const checkAssignmentOwnership = async (request, response, next) => {
  const user = basicAuth(request);
  console.log("user", user);
  if (!user) {
    logger.error("Unauthorized");
    // response.set("WWW-Authenticate", 'Basic realm="Basic Authentication"');
    return response.status(401).send("Unauthorized");
  }
  const result = await validateUser(user.name, user.pass);
  console.log("result", result);
  if (!result) {
    logger.error("Unauthorized");
    // response.set("WWW-Authenticate", 'Basic realm="Basic Authentication"');
    return response.status(401).send("Unauthorized");
  }

  const assignment = await Assignment.findByPk(request.params.id);

  //   console.log("ass", assignment);

  if (!assignment) {
    logger.error("Assignment not found");
    return response.status(404).json({ error: "Assignment not found" });
  }

  if (assignment.dataValues.userId !== result.id) {
    return response
      .status(403)
      .json({ error: "Unauthorized: You do not own this assignment" });
  }
  request.userId = result.id;

  // If the user is the owner and Authentication succeeded, allow the operation
  next();
};

// Middleware for Basic Authentication
const authenticate = async (request, response, next) => {
  const user = basicAuth(request);
  console.log("user", user);
  if (!user) {
    logger.error("Unauthorized");
    return response.status(401).send("Unauthorized");
  }
  const result = await validateUser(user.name, user.pass);
  console.log("result", result);
  if (!result) {
    logger.error("Unauthorized");
    return response.status(401).send("Unauthorized");
  }
  request.userId = result.id;
  // Authentication succeeded
  next();
};

const validateUser = async (email, password) => {
  const userList = await User.findAll({ where: { email: email } });
  //   console.log("userList", userList);
  for (const user of userList) {
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (isPasswordValid) {
      return user.dataValues; // Return the user object if the password is valid
    }
  }
  return null;
};

// const checkPost = (req, res, next) => {
//   if (req.method !== "POST") {
//     return res.status(405).send("Method Not Allowed");
//   }
//   if (
//     Object.keys(req.query).length !== 0 ||
//     Object.keys(req.params).length !== 0
//   ) {
//     return res.status(400).send("Bad Request");
//   }
//   next();
// };

router.use((req, res, next) => {
  if (req.method === "PATCH") {
    logger.error("Method Not Allowed");
    return res.status(405).send("Method Not Allowed");
  }
  next();
});

let getCount = 0;
let postCount = 0;
let getCountId = 0;
let putCount = 0;
let deleteCount = 0;

router.get("/assignments", (req, res, next) => {
  if (req.method !== "GET") {
    logger.error("Method Not Allowed");
    return res.status(405).send("Method Not Allowed - need get");
  }
  if (
    Object.keys(req.query).length !== 0 ||
    Object.keys(req.body).length !== 0 ||
    Object.keys(req.params).length !== 0
  ) {
    logger.error("Bad Request - has query or body or params");
    return res.status(400).send("Bad Request");
  }
  logger.info(`get assignments count: ${getCount++}`);
  assignments.increment("get-assignments.total");
  next();
});

router.post("/assignments", (req, res, next) => {
  if (req.method !== "POST") {
    logger.error("Method Not Allowed - need post");
    return res.status(405).send("Method Not Allowed");
  }
  if (
    Object.keys(req.query).length !== 0 ||
    Object.keys(req.params).length !== 0
  ) {
    logger.error("Bad Request - has query or params");
    return res.status(400).send("Bad Request");
  }
  logger.info(`post assignments count: ${postCount++}`);
  assignments.increment("post-assignments.total");
  next();
});

router.get("/assignments/:id", (req, res, next) => {
  if (req.method !== "GET") {
    logger.error("Method Not Allowed - need Get");
    return res.status(405).send("Method Not Allowed");
  }
  if (
    Object.keys(req.query).length !== 0 ||
    Object.keys(req.body).length !== 0
  ) {
    logger.error("Bad Request - has query or params");
    return res.status(400).send("Bad Request");
  }
  logger.info(`get assignments by id count: ${getCountId++}`);
  assignments.increment("get-assignment.total");
  next();
});

router.put("/assignments/:id", (req, res, next) => {
  if (req.method !== "PUT") {
    logger.error("Method Not Allowed - need Put");
    return res.status(405).send("Method Not Allowed");
  }
  if (Object.keys(req.query).length !== 0) {
    logger.error("Bad Request - has query");
    return res.status(400).send("Bad Request");
  }
  logger.info(`put assignments count: ${putCount++}`);
  assignments.increment("put-assignments.total");
  next();
});

router.delete("/assignments/:id", (req, res, next) => {
  if (req.method !== "DELETE") {
    logger.error("Method Not Allowed - need Delete");
    return res.status(405).send("Method Not Allowed");
  }
  if (
    Object.keys(req.query).length !== 0 ||
    Object.keys(req.body).length !== 0
  ) {
    logger.error("Bad Request - has query or body");
    return res.status(400).send("Bad Request");
  }
  logger.info(`delete assignments count: ${deleteCount++}`);
  assignments.increment("delete-assignments.total");
  next();
});

router
  .route("/assignments")
  .all(authenticate)
  .get(assignmentController.get)
  .post(assignmentController.post);

router
  .route("/assignments/:id")
  .all(checkAssignmentOwnership)
  .get(assignmentController.getOne)
  .put(assignmentController.update)
  .delete(assignmentController.remove);

const getUser = async (request, response, next) => {
  const user = basicAuth(request);
  console.log("user", user);
  if (!user) {
    logger.error("Unauthorized");
    // response.set("WWW-Authenticate", 'Basic realm="Basic Authentication"');
    return response.status(401).send("Unauthorized");
  }
  const result = await validateUser(user.name, user.pass);
  console.log("result", result);

  if (!result) {
    logger.error("Unauthorized");
    // response.set("WWW-Authenticate", 'Basic realm="Basic Authentication"');
    return response.status(401).send("Unauthorized");
  }
  request.user = result;
  next();
};

router.post("/assignments/:id/submission", (req, res, next) => {
  if (req.method !== "POST") {
    logger.error("Method Not Allowed - need post");
    return res.status(405).send("Method Not Allowed");
  }
  if (Object.keys(req.query).length !== 0) {
    logger.error("Bad Request - has query");
    return res.status(400).send("Bad Request");
  }
  logger.info(`post submission count: ${postCount++}`);
  assignments.increment("post-submission.total");
  next();
});

router
  .route("/assignments/:id/submission")
  .all(getUser)
  .post(assignmentController.postSub);

export default router;
