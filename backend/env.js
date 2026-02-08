import dotenv from "dotenv";

/*
  "databaseHost" can either be "local" or "cloud" depending on what database you want to use.
  To save costs, please use "local" and set up a database using mySQL Workbench.
*/
const databaseHost = "local";

const envFile =
  databaseHost == "local" ? ".env" : ".env.cloud";

dotenv.config({ path: envFile });