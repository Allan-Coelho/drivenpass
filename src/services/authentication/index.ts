import * as repositories from "@/repositories";
import { exclude } from "@/utilities/prisma";
import { User } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { invalidCredentialsError, duplicatedEmailError } from "./errors";

async function sign_in(params: SignInParams): Promise<SignInResult> {
  const { email, password } = params;

  const user = await getUserOrFail(email);

  await validatePasswordOrFail(password, user.password);

  const token = await createSession(user.id);

  return {
    user: exclude(user, "password"),
    token,
  };
}

async function sign_up({ email, password }: CreateUserParams) {
  await validateUniqueEmailOrFail(email);
  const user = await repositories.users.create({ email, password });

  return user;
}

async function getUserOrFail(email: string): Promise<GetUserOrFailResult> {
  const user = await repositories.users.findByEmail(email, {
    id: true,
    email: true,
    password: true,
  });
  if (!user) throw invalidCredentialsError();

  return user;
}

async function validateUniqueEmailOrFail(email: string) {
  const userWithSameEmail = await repositories.users.findByEmail(email);
  if (userWithSameEmail) {
    throw duplicatedEmailError();
  }
}

async function createSession(userId: number) {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET);
  await repositories.sessions.create({
    token,
    userId,
  });

  return token;
}

async function validatePasswordOrFail(password: string, userPassword: string) {
  const isPasswordValid = await bcrypt.compare(password, userPassword);
  if (!isPasswordValid) throw invalidCredentialsError();
}

export type SignInParams = Pick<User, "email" | "password">;

type SignInResult = {
  user: Pick<User, "id" | "email">;
  token: string;
};

export type CreateUserParams = Pick<User, "email" | "password">;

type GetUserOrFailResult = Pick<User, "id" | "email" | "password">;

export const authentication = {
  sign_in,
  sign_up,
};
