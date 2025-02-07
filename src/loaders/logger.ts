import * as winston from "winston";
import * as expressWinston from "express-winston";
import env from "@/config";

const loggerOptions: expressWinston.LoggerOptions = {
  transports: [new winston.transports.Console()],
  format: winston.format.combine(
    winston.format.json(),
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" }),
    winston.format.prettyPrint(),
    winston.format.colorize({ all: true })
  ),
};

export default expressWinston.logger(loggerOptions);
