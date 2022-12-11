import * as services from "@/services";
import { SignInParams } from "@/services";
import { Request, Response } from "express";
import httpStatus from "http-status";

export async function sign_in(req: Request, res: Response) {
  const { email, password } = req.body as SignInParams;

  try {
    const result = await services.authentication.sign_in({ email, password });

    return res.status(httpStatus.OK).send(result);
  } catch (error) {
    return res.status(httpStatus.UNAUTHORIZED).send({});
  }
}

export async function sign_up(request: Request, response: Response) {
  const { email, password } = request.body;

  try {
    const user = await services.authentication.sign_up({ email, password });
    return response.status(httpStatus.OK).json({
      id: user.id,
      email: user.email,
    });
  } catch (error) {
    if (error.name === "DuplicatedEmailError") {
      return response.status(httpStatus.CONFLICT).send(error);
    }
    return response.status(httpStatus.BAD_REQUEST).send(error);
  }
}
