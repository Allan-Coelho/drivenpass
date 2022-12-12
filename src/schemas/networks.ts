import { NetworksBody } from "@/protocols";
import Joi from "joi";

export const networksSchema = Joi.object<NetworksBody>({
  title: Joi.string().min(1).required(),
  network: Joi.string().min(0).max(32).required(),
  password: Joi.string().min(1).required(),
});
