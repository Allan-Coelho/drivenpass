import { AuthenticatedRequest } from "@/middlewares";
import { NetworksBody } from "@/protocols";
import * as services from "@/services";
import { Response } from "express";
import httpStatus from "http-status";
import { exclude } from "@/utilities/prisma";

export async function create_network(
  request: AuthenticatedRequest,
  response: Response
) {
  const { title, password, network } = request.body as NetworksBody;
  const { user_id } = request;

  try {
    const created_network = await services.networks.create(
      {
        title,
        password,
        network,
      },
      user_id
    );

    return response
      .status(httpStatus.CREATED)
      .send(exclude(created_network, "password"));
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
    const network = await services.networks.get_network_by_id(
      Number(id),
      user_id
    );

    return response.status(httpStatus.OK).send(network);
  } catch (error) {
    if (error.name === "Unauthorized_user_error") {
      return response.status(httpStatus.UNAUTHORIZED).send(error);
    }

    if (error.name === "Network_not_found_error") {
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
    if (error.name === "Unauthorized_user_error") {
      return response.status(httpStatus.UNAUTHORIZED).send(error);
    }

    if (error.name === "Network_not_found_error") {
      return response.status(httpStatus.NOT_FOUND).send(error);
    }

    return response.sendStatus(httpStatus.INTERNAL_SERVER_ERROR);
  }
}
