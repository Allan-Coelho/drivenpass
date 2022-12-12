import { prisma } from "@/configurations";
import { NetworksBody } from "@/protocols";

function create(network_body: NetworksBody, user_id: number) {
  return prisma.network.create({
    data: {
      password: network_body.password,
      title: network_body.title,
      network: network_body.network,
      userId: user_id,
    },
  });
}

function find_by_id(id: number) {
  return prisma.network.findFirst({
    where: {
      id,
    },
  });
}

function find_many(user_id: number) {
  return prisma.network.findMany({
    where: {
      userId: user_id,
    },
  });
}

function delete_by_id(id: number) {
  return prisma.network.delete({
    where: {
      id,
    },
  });
}

export const networks = {
  create,
  find_by_id,
  find_many,
  delete_by_id,
};
