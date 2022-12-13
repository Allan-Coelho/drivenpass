import * as jwt from "jsonwebtoken";
import { User } from "@prisma/client";
import { create_user } from "./factories";
import { create_session } from "./factories";
import { prisma } from "@/configurations";

export async function clean_database() {
  await prisma.session.deleteMany({});
  await prisma.credential.deleteMany({});
  await prisma.network.deleteMany({});
  await prisma.user.deleteMany({});
}

export async function generate_valid_token(user?: User) {
  const incoming_user = user || (await create_user());
  const token = jwt.sign({ user_id: incoming_user.id }, process.env.JWT_SECRET);

  await create_session(token);

  return token;
}
