import { AuthenticatedRequest } from "@/middlewares";
import { ApplicationError, CredentialsBody } from "@/protocols";
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
  } catch (error) {
    if (error.message === "DuplicatedTitleError") {
      return response.status(httpStatus.CONFLICT).send(error);
    }
  }
}

export async function get_credentials(
  request: AuthenticatedRequest,
  response: Response
) {
  const { user_id } = request;

  try {
    const credentials = await services.credentials.get_credentials(user_id);

    return response.status(httpStatus.CREATED).send(credentials);
  } catch (error) {
    return response.sendStatus(httpStatus.INTERNAL_SERVER_ERROR);
  }
}
