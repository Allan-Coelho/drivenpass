import { SignInParams } from "@/services";
import Joi from "joi";

export const authenticationSchema = Joi.object<SignInParams>({
  email: Joi.string().email().required(),
  password: Joi.string().min(10).required(),
});
