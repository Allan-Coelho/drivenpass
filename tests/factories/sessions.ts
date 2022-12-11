import { Session } from "@prisma/client";
import { createUser } from "./index";
import { prisma } from "@/configurations";

export async function createSession(token: string): Promise<Session> {
  const user = await createUser();

  return prisma.session.create({
    data: {
      token: token,
      userId: user.id,
    },
  });
}
