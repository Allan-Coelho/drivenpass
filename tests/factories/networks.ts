import faker from "@faker-js/faker";
import { Network } from "@prisma/client";
import { prisma } from "@/configurations";
import cryptr from "@/configurations/encryption";

export async function create_network(
  user_id: number,
  params: Partial<Network> = {}
): Promise<Network> {
  const password = params.password || faker.internet.password(10);
  const encryptedPassword = cryptr.encrypt(password);
  const title = params.title || faker.random.words();
  const network = params.title || faker.random.words();

  return prisma.network.create({
    data: {
      password: encryptedPassword,
      network: network,
      title: title,
      userId: user_id,
    },
  });
}

export function create_network_body(): Partial<Network> {
  const password = faker.internet.password(10);
  const encryptedPassword = cryptr.encrypt(password);
  const title = faker.random.words();
  const network = faker.random.words();

  return {
    password: encryptedPassword,
    network: network,
    title: title,
  };
}
