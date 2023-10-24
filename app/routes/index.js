import assignmentRouter from "./assignment.js";
import healthzRouter from "./healthz.js";

export const healthCheck = (app) => {
  app.use("/healthCheck/", healthzRouter);
};

export const assignment = (app) => {
  app.use("/v1/", assignmentRouter);
};
