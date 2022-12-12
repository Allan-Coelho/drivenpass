import { CredentialsBody } from "@/protocols";
import * as repositories from "@/repositories";
import bcrypt from "bcrypt";
import { duplicatedTitleError } from "./errors";

async function create(credentials_body: CredentialsBody) {
  await uniqueTitleOrFail(credentials_body.title, credentials_body.userId);
  credentials_body.password = await bcrypt.hash(credentials_body.password, 10);
  const credential = await repositories.credentials.create(credentials_body);

  return credential;
}

async function uniqueTitleOrFail(title: string, user_id: number) {
  const result = await repositories.credentials.findByTitle(user_id, title);

  if (result !== null) throw duplicatedTitleError();
}

export const credentials = {
  create,
};
