import express from "express";
import { body } from "express-validator";

import controller from "@/controllers/valocracy.controller";
//import jwtMiddleware from "@/middlewares/jwt.middleware";

const route = express.Router();

route.get("/balance_usdt", [
  //jwtMiddleware.validJWTNeeded.bind(jwtMiddleware),
  controller.balanceOfUsdt.bind(controller)
]);

route.post("/config", [
  //jwtMiddleware.validJWTNeeded.bind(jwtMiddleware),
  controller.config.bind(controller)
]);

route.get("/allowance", [
  //jwtMiddleware.validJWTNeeded.bind(jwtMiddleware),
  controller.allowance.bind(controller)
]);

route.post("/error", [
  //jwtMiddleware.validJWTNeeded.bind(jwtMiddleware),
  controller.error.bind(controller)
]);


export default route;
