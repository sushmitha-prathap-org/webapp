import express from "express";
import basicAuth from "basic-auth";

import * as assignmentController from "../controller/assignments.js";
import User from "../models/user.js";

const router = express.Router();

router
  .route("/assignment")
  .post(assignmentController.post)
  .get(assignmentController.get);

router
  .route("/assignment/:id")
  .get(assignmentController.getOne)
  .put(assignmentController.update)
  .delete(assignmentController.remove);

export default router;
