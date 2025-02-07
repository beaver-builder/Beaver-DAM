import express from "express";
import { body } from "express-validator";

import controller from "@/controllers/wallet.controller";
//import jwtMiddleware from "@/middlewares/jwt.middleware";

const walletRouter = express.Router();

walletRouter.post("/balanceof", [
  //jwtMiddleware.validJWTNeeded.bind(jwtMiddleware),
  controller.balanceOf.bind(controller)
]);


export default walletRouter;
