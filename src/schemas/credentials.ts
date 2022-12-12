import { CredentialsBody } from "@/protocols";
import Joi from "joi";

export const credentialsSchema = Joi.object<Omit<CredentialsBody, "userId">>({
  title: Joi.string().min(1).required(),
  username: Joi.string().min(1).required(),
  url: Joi.string().uri().required(),
  password: Joi.string().min(1).required(),
});
