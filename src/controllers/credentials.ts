import { AuthenticatedRequest } from "@/middlewares";
import { CredentialsBody } from "@/protocols";
import * as services from "@/services";
import { Response } from "express";
import httpStatus from "http-status";
import { exclude } from "@/utilities/prisma";

export async function create_credentials(
  request: AuthenticatedRequest,
  response: Response
) {
  const { title, url, password, username } = request.body as CredentialsBody;
  const { user_id } = request;

  try {
    const result = await services.credentials.create({
      title,
      url,
      password,
      username,
      userId: user_id,
    });

    return response
      .status(httpStatus.CREATED)
      .send(exclude(result, "password"));
  } catch (error) {}
}
