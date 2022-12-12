import { NetworksBody } from "@/protocols";
import * as repositories from "@/repositories";
import { Network } from "@prisma/client";
import { unauthorized_user_error, network_not_found_error } from "./errors";
import cryptr from "@/configurations/encryption";

async function create(network_body: NetworksBody, user_id: number) {
  network_body.password = cryptr.encrypt(network_body.password);
  const network = await repositories.networks.create(network_body, user_id);

  return network;
}

async function get_networks(user_id: number) {
  const networks = await repositories.networks.find_many(user_id);
  const decryptedNetworks = decryptNetworks(networks);

  return decryptedNetworks;
}

async function get_network_by_id(id: number, user_id: number) {
  const network = await repositories.networks.find_by_id(id);
  if (network.userId !== user_id) throw unauthorized_user_error();
  const decryptedNetwork = decryptNetworks(network);

  return decryptedNetwork;
}

async function delete_network_by_id(id: number, user_id: number) {
  const network = await repositories.networks.delete_by_id(id);

  if (network === null) {
    throw network_not_found_error();
  }

  if (network.userId !== user_id) {
    throw unauthorized_user_error();
  }

  return network;
}

function decryptNetworks(networks: Network | Network[]) {
  if (Array.isArray(networks)) {
    for (let index = 0, len = networks.length; index < len; index++) {
      const element = networks[index];

      element.password = cryptr.decrypt(element.password);
    }

    return networks;
  }

  networks.password = cryptr.decrypt(networks.password);
  return networks;
}

export const networks = {
  create,
  get_network_by_id,
  get_networks,
  delete_network_by_id,
};
