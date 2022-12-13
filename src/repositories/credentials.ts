import { prisma } from "@/configurations";
import { CredentialsBody } from "@/protocols";

function create(credential_body: CredentialsBody) {
  return prisma.credential.create({
    data: {
      title: credential_body.title,
      password: credential_body.password,
      url: credential_body.url,
      userId: credential_body.userId,
      username: credential_body.username,
    },
  });
}

function find_by_id(id: number) {
  return prisma.credential.findFirst({
    where: {
      id,
    },
  });
}

function find_many(user_id: number) {
  return prisma.credential.findMany({
    where: {
      userId: user_id,
    },
  });
}

function delete_by_id(id: number) {
  return prisma.credential.delete({
    where: {
      id: id,
    },
  });
}

function find_by_title(user_id: number, title: string) {
  return prisma.credential.findFirst({
    where: {
      userId: user_id,
      title,
    },
  });
}

export const credentials = {
  create,
  find_by_id,
  find_many,
  find_by_title,
  delete_by_id,
};
