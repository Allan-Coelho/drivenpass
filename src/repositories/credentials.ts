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

function findById(id: number) {
  return prisma.credential.findFirst({
    where: {
      id,
    },
  });
}

function findMany(user_id: number) {
  return prisma.credential.findMany({
    where: {
      userId: user_id,
    },
  });
}

function deleteById(id: number) {
  return prisma.credential.delete({
    where: {
      id,
    },
  });
}

function findByTitle(user_id: number, title: string) {
  return prisma.credential.findFirst({
    where: {
      userId: user_id,
      title,
    },
  });
}

export const credentials = {
  create,
  findById,
  findMany,
  findByTitle,
  deleteById,
};
