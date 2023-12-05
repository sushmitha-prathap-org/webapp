import assignmentRouter from "./assignment.js";
import healthzRouter from "./healthz.js";

export const healthCheck = (app) => {
  app.use("/healthChecks/", healthzRouter);
};

export const assignment = (app) => {
  app.use("/v3/", assignmentRouter);
};
