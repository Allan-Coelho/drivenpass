import { Session } from "@prisma/client";
import { create_user } from "./index";
import { prisma } from "@/configurations";

export async function create_session(token: string): Promise<Session> {
  const user = await create_user();

  return prisma.session.create({
    data: {
      token: token,
      userId: user.id,
    },
  });
}
