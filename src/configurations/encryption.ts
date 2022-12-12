import { load_env } from "./load_envs";

load_env();

const Cryptr = require("cryptr");
const cryptr = new Cryptr(process.env.PASSWORD_ENCRYPTION_SECRET);

export default cryptr;
