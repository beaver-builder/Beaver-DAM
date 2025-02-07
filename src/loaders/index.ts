import { Application } from "express";

import expressLoader from "./express";
// import cron from "./cron";

export default async (app: Application) => {
  console.log("Initializing loaders...");

  await expressLoader(app);
  //clcron();
  console.log("Express loaded.");
};
