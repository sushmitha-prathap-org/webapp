import express from "express";
import basicAuth from "basic-auth";
import bcrypt from "bcrypt";

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
  const result = await validateUser(user.name, user.pass);
  console.log("result", result);
  if (!user || !result) {
    return response.status(401).send("Unauthorized");
  }
  request.userId = result.id;
  // Authentication succeeded
  next();
};

async function validateUser(email, password) {
  const userList = await User.findAll({ where: { email: email } });
  //   console.log("userList", userList);
  for (const user of userList) {
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (isPasswordValid) {
      return user.dataValues; // Return the user object if the password is valid
    }
  }

  return null;
}

router
  .route("/assignment")
  .all(authenticate)
  .post(assignmentController.post)
  .get(assignmentController.get);

router
  .route("/assignment/:id")
  .all(checkAssignmentOwnership)
  .get(assignmentController.getOne)
  .put(assignmentController.update)
  .delete(assignmentController.remove);

export default router;
