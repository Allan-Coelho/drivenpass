import dotenv from "dotenv";
import dotenvExpand from "dotenv-expand";

export function load_env() {
  let path = ".env";

  if (process.env.NODE_ENV === "development") {
    path = ".env.development";
  }

  if (process.env.NODE_ENV === "test") {
    path = ".env.test";
  }

  const current_envs = dotenv.config({ path });
  dotenvExpand.expand(current_envs);
}
