import {
  create_credentials,
  delete_credential_by_id,
  get_credentials,
  get_credential_by_id,
} from "@/controllers";
import { authentication, validateBody, validateParams } from "@/middlewares";
import { idSchema } from "@/schemas/appSchemas";
import { credentialsSchema } from "@/schemas/credentials";
import { Router } from "express";

const credentials = Router();

credentials
  .all("/*", authentication)
  .post("/", validateBody(credentialsSchema), create_credentials)
  .get("/", get_credentials)
  .get("/:id", validateParams(idSchema), get_credential_by_id)
  .delete("/:id", validateParams(idSchema), delete_credential_by_id);

export { credentials };
