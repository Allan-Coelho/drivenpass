import faker from "@faker-js/faker";
import { Credential } from "@prisma/client";
import { prisma } from "@/configurations";
import cryptr from "@/configurations/encryption";

export async function create_credential(
  user_id: number,
  params: Partial<Credential> = {}
): Promise<Credential> {
  const password = params.password || faker.internet.password(10);
  const encryptedPassword = cryptr.encrypt(password);
  const title = params.title || faker.random.words();
  const url = params.url || faker.internet.url();
  const username = params.username || faker.random.word();

  return prisma.credential.create({
    data: {
      password: encryptedPassword,
      title: title,
      url: url,
      username: username,
      userId: user_id,
    },
  });
}

export function create_credential_body(): Partial<Credential> {
  const password = faker.internet.password(10);
  const encryptedPassword = cryptr.encrypt(password);
  const title = faker.random.words();
  const url = faker.internet.url();
  const username = faker.random.word();

  return {
    password: encryptedPassword,
    title: title,
    url: url,
    username: username,
  };
}
