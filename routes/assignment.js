import express from "express";
import basicAuth from "basic-auth";
import bcrypt from "bcrypt";
import sequelize from "../database.js";

import * as assignmentController from "../controller/assignments.js";
import User from "../models/user.js";
import Assignment from "../models/assignment.js";

const router = express.Router();

const checkAssignmentOwnership = async (request, response, next) => {
  const user = basicAuth(request);
  console.log("user", user);
  const result = await validateUser(user.name, user.pass);
  console.log("result", result);
  if (!user || !result) {
    // response.set("WWW-Authenticate", 'Basic realm="Basic Authentication"');
    return response.status(401).send("Unauthorized");
  }

  const assignment = await Assignment.findByPk(request.params.id);

  //   console.log("ass", assignment);

  if (!assignment) {
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
    return response.status(401).send("Unauthorized");
  }
  const result = await validateUser(user.name, user.pass);
  console.log("result", result);
  if (!result) {
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

const checkDbMiddleware = (req, res, next) => {
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
      resolve(true);
    } catch (error) {
      console.error("Unable to connect to the database:", error);
      reject(error);
    }
  });
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
    return res.status(405).send("Method Not Allowed");
  }
  next();
});

router.get("/assignments", (req, res, next) => {
  if (req.method !== "GET") {
    return res.status(405).send("Method Not Allowed");
  }
  if (
    Object.keys(req.query).length !== 0 ||
    Object.keys(req.body).length !== 0 ||
    Object.keys(req.params).length !== 0
  ) {
    return res.status(400).send("Bad Request");
  }
  next();
});

router.post("/assignments", (req, res, next) => {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }
  if (
    Object.keys(req.query).length !== 0 ||
    Object.keys(req.params).length !== 0
  ) {
    return res.status(400).send("Bad Request");
  }
  next();
});

router.get("/assignments/:id", (req, res, next) => {
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

router.put("/assignments/:id", (req, res, next) => {
  if (req.method !== "PUT") {
    return res.status(405).send("Method Not Allowed");
  }
  if (Object.keys(req.query).length !== 0) {
    return res.status(400).send("Bad Request");
  }
  next();
});

router.delete("/assignments/:id", (req, res, next) => {
  if (req.method !== "DELETE") {
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

// (req, res, next) => {
//   // render a regular page
//   res.render('regular')
// })

// router.route("/assignments").all(authenticate);

// For GET requests to "/assignments"
// router.get(checkGetAll, assignmentController.get);

// // For POST requests to "/assignments"
// router.post(checkPost, assignmentController.post);

// router.route("/assignments/:id").all(checkAssignmentOwnership);

// // For GET requests to "/assignments/:id"
// router.get(checkGet, assignmentController.getOne);

// // For PUT requests to "/assignments/:id"
// router.put(checkPut, assignmentController.update);

// // For DELETE requests to "/assignments/:id"
// router.delete(checkDel, assignmentController.remove);

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

router
  .route("/healthz")
  .all(checkDbMiddleware)
  .get(async (req, res) => {
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

export default router;
