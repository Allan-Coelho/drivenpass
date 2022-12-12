import { authentication, validateBody, validateParams } from "@/middlewares";
import { idSchema } from "@/schemas/appSchemas";
import { networksSchema } from "@/schemas/networks";
import { Router } from "express";
import {
  create_network,
  get_network_by_id,
  get_networks,
  delete_network_by_id,
} from "@/controllers";

const networks = Router();

networks
  .all("/*", authentication)
  .post("/", validateBody(networksSchema), create_network)
  .get("/", get_networks)
  .get("/:id", validateParams(idSchema), get_network_by_id)
  .delete("/:id", validateParams(idSchema), delete_network_by_id);

export { networks };
