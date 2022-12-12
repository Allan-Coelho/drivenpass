import { ApplicationError } from "@/protocols";

export function unauthorized_user_error(): ApplicationError {
  return {
    name: "Unauthorized_user_error",
    message: "The user does not have authorization",
  };
}

export function network_not_found_error(): ApplicationError {
  return {
    name: "Network_not_found_error",
    message: "This network does not exist",
  };
}
