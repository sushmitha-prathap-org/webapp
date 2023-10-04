import assignmentRouter from "./assignment.js";

export default (app) => {
  app.use("/", assignmentRouter);
};
