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
  } catch (error) {
    if (error.name === "DuplicatedTitleError") {
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

export async function get_credential_by_id(
  request: AuthenticatedRequest,
  response: Response
) {
  const { user_id } = request;
  const { id } = request.params;

  try {
    const credential = await services.credentials.get_credential_by_id(
      Number(id),
      user_id
    );

    return response.status(httpStatus.CREATED).send(credential);
  } catch (error) {
    if (error.name === "Unauthorized_user_error") {
      return response.status(httpStatus.UNAUTHORIZED).send(error);
    }

    if (error.name === "Credential_not_found_error") {
      return response.status(httpStatus.NOT_FOUND).send(error);
    }
    return response.sendStatus(httpStatus.INTERNAL_SERVER_ERROR);
  }
}

export async function delete_credential_by_id(
  request: AuthenticatedRequest,
  response: Response
) {
  const { user_id } = request;
  const { id } = request.params;

  try {
    await services.credentials.delete_credential_by_id(Number(id), user_id);

    return response.sendStatus(httpStatus.OK);
  } catch (error) {
    if (error.name === "Unauthorized_user_error") {
      return response.status(httpStatus.UNAUTHORIZED).send(error);
    }

    if (error.name === "Credential_not_found_error") {
      return response.status(httpStatus.NOT_FOUND).send(error);
    }

    return response.sendStatus(httpStatus.INTERNAL_SERVER_ERROR);
  }
}
