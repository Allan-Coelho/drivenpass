import { ApplicationError } from "@/protocols";

export function duplicatedTitleError(): ApplicationError {
  return {
    name: "duplicatedTitleError",
    message: "The user already has an credential with this title",
  };
}
