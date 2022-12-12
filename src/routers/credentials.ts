import { sign_in, sign_up } from "@/controllers";
import { authentication, validateBody, validateParams } from "@/middlewares";
import { idSchema } from "@/schemas/appSchemas";
import { credentialsSchema } from "@/schemas/credentials";
import { Router } from "express";

const credentials = Router();

credentials
  .all("/*", authentication)
  .post("/", validateBody(credentialsSchema))
  .get("/", sign_up)
  .get("/:id", validateParams(idSchema), sign_up)
  .delete("/:id", validateParams(idSchema), sign_up);

export { credentials };
