import { ApplicationError } from "@/protocols";

export function duplicatedTitleError(): ApplicationError {
  return {
    name: "DuplicatedTitleError",
    message: "The user already has an credential with this title",
  };
}
