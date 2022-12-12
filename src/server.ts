import express, { Express } from "express";
import cors from "cors";
import { load_env, connectDb } from "@/configurations";
import * as routers from "@/routers";

load_env();

const app = express();
app
  .use(cors())
  .use(express.json())
  .get("/health", (_req, res) => res.send("OK!"))
  .use("/authentication", routers.authentication)
  .use("/credentials", routers.credentials);

export function initialize_server(): Promise<Express> {
  connectDb();
  return Promise.resolve(app);
}

initialize_server().then(() => {
  const port = process.env.PORT;
  app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
  });
});

export default app;
