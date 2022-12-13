import express, { Express } from "express";
import cors from "cors";
import { load_env, connect_database } from "@/configurations";
import * as routers from "@/routers";

load_env();

const app = express();
app
  .use(cors())
  .use(express.json())
  .get("/health", (_req, res) => res.send("OK!"))
  .use("/authentication", routers.authentication)
  .use("/credentials", routers.credentials)
  .use("/networks", routers.networks);

export function initialize_server(): Promise<Express> {
  connect_database();
  return Promise.resolve(app);
}

export default app;
