import { sign_in, sign_up } from "@/controllers";
import { validateBody } from "@/middlewares";
import { authenticationSchema } from "@/schemas";
import { Router } from "express";

const authentication = Router();

authentication.post("/sign-in", validateBody(authenticationSchema), sign_in);
authentication.post("/sign-up", validateBody(authenticationSchema), sign_up);

export { authentication };
