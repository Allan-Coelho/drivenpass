import { CredentialsBody } from "@/protocols";
import * as repositories from "@/repositories";
import bcrypt from "bcrypt";
import {
  credential_not_found_error,
  duplicated_title_error,
  unauthorized_user_error,
} from "./errors";

async function create(credentials_body: CredentialsBody) {
  await unique_title_or_fail(credentials_body.title, credentials_body.userId);
  credentials_body.password = await bcrypt.hash(credentials_body.password, 10);
  const credential = await repositories.credentials.create(credentials_body);

  return credential;
}

async function get_credentials(user_id: number) {
  const credentials = await repositories.credentials.find_many(user_id);

  return credentials;
}

async function get_credential_by_id(id: number, user_id: number) {
  const credential = await repositories.credentials.find_by_id(id);

  if (credential.userId !== user_id) {
    throw unauthorized_user_error();
  }

  return credential;
}

async function delete_credential_by_id(id: number, user_id: number) {
  const credential = await repositories.credentials.delete_by_id(id);

  if (credential === null) {
    throw credential_not_found_error();
  }

  if (credential.userId !== user_id) {
    throw unauthorized_user_error();
  }

  return credentials;
}

async function unique_title_or_fail(title: string, user_id: number) {
  const result = await repositories.credentials.find_by_title(user_id, title);

  if (result !== null) throw duplicated_title_error();
}

export const credentials = {
  create,
  get_credentials,
  get_credential_by_id,
  delete_credential_by_id,
};
