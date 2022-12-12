import { AuthenticatedRequest } from "@/middlewares";
import { NetworksBody } from "@/protocols";
import * as services from "@/services";
import { Response } from "express";
import httpStatus from "http-status";
import {
  network_not_found_error,
  unauthorized_user_error,
} from "@/services/networks/errors";

export async function create_network(
  request: AuthenticatedRequest,
  response: Response
) {
  const { title, password, network } = request.body as NetworksBody;
  const { user_id } = request;

  try {
    await services.networks.create(
      {
        title,
        password,
        network,
      },
      user_id
    );

    return response.sendStatus(httpStatus.CREATED);
  } catch (error) {
    return response.sendStatus(httpStatus.INTERNAL_SERVER_ERROR);
  }
}

export async function get_networks(
  request: AuthenticatedRequest,
  response: Response
) {
  const { user_id } = request;

  try {
    const networks = await services.networks.get_networks(user_id);

    return response.status(httpStatus.OK).send(networks);
  } catch (error) {
    return response.sendStatus(httpStatus.INTERNAL_SERVER_ERROR);
  }
}

export async function get_network_by_id(
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
    if (error.name === unauthorized_user_error.name) {
      return response.status(httpStatus.UNAUTHORIZED).send(error);
    }

    if (error.name === network_not_found_error.name) {
      return response.status(httpStatus.NOT_FOUND).send(error);
    }
    return response.sendStatus(httpStatus.INTERNAL_SERVER_ERROR);
  }
}

export async function delete_network_by_id(
  request: AuthenticatedRequest,
  response: Response
) {
  const { user_id } = request;
  const { id } = request.params;

  try {
    await services.networks.delete_network_by_id(Number(id), user_id);

    return response.sendStatus(httpStatus.OK);
  } catch (error) {
    if (error.name === unauthorized_user_error.name) {
      return response.status(httpStatus.UNAUTHORIZED).send(error);
    }

    if (error.name === network_not_found_error.name) {
      return response.status(httpStatus.NOT_FOUND).send(error);
    }

    return response.sendStatus(httpStatus.INTERNAL_SERVER_ERROR);
  }
}
