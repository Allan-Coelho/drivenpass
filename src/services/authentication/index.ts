import * as repositories from "@/repositories";
import { exclude } from "@/utilities/prisma";
import { User } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { invalid_credentials_error, duplicated_email_error } from "./errors";

async function sign_in(params: SignInParams): Promise<SignInResult> {
  const { email, password } = params;

  const user = await get_user_or_fail(email);

  await validate_password_or_fail(password, user.password);

  const token = await create_session(user.id);

  return {
    user: exclude(user, "password"),
    token,
  };
}

async function sign_up({ email, password }: CreateUserParams) {
  await validate_unique_email_or_fail(email);
  const user = await repositories.users.create({ email, password });

  return user;
}

async function get_user_or_fail(email: string): Promise<GetUserOrFailResult> {
  const user = await repositories.users.findByEmail(email, {
    id: true,
    email: true,
    password: true,
  });
  if (!user) throw invalid_credentials_error();

  return user;
}

async function validate_unique_email_or_fail(email: string) {
  const user_with_same_email = await repositories.users.findByEmail(email);
  if (user_with_same_email !== null) {
    throw duplicated_email_error();
  }
}

async function create_session(user_id: number) {
  const token = jwt.sign({ user_id }, process.env.JWT_SECRET);
  await repositories.sessions.create({
    token,
    userId: user_id,
  });

  return token;
}

async function validate_password_or_fail(
  password: string,
  userPassword: string
) {
  const isPasswordValid = await bcrypt.compare(password, userPassword);
  if (!isPasswordValid) throw invalid_credentials_error();
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
