import { ApplicationError } from "@/protocols";

export function duplicated_title_error(): ApplicationError {
  return {
    name: "DuplicatedTitleError",
    message: "The user already has an credential with this title",
  };
}

export function unauthorized_user_error(): ApplicationError {
  return {
    name: "Unauthorized_user_error",
    message: "The user does not have authorization",
  };
}

export function credential_not_found_error(): ApplicationError {
  return {
    name: "Credential_not_found_error",
    message: "The user does not have authorization",
  };
}
