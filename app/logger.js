import winston from "winston";

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(), // Add timestamp to logs
    winston.format.json()
  ),
  defaultMeta: { service: "webapp" },
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: "webapp.log" }),
  ],
});

export default logger;
