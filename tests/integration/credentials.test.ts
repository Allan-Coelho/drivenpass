import app, { initialize_server } from "@/server";
import faker from "@faker-js/faker";
import { prisma } from "@/configurations";
import httpStatus from "http-status";
import * as jwt from "jsonwebtoken";
import supertest from "supertest";
import { create_user } from "../factories";
import { clean_database } from "../helpers";

beforeAll(async () => {
  await initialize_server();
});

beforeEach(async () => {
  await clean_database();
});

const server = supertest(app);
const route = "/credentials";

describe(`POST ${route}`, () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await server.get(route);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();

    const response = await server
      .get(route)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if there is no session for given token", async () => {
    const user_without_session = await create_user();
    const token = jwt.sign(
      { user_id: user_without_session.id },
      process.env.JWT_SECRET
    );

    const response = await server
      .get(route)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe("when token is valid", () => {});
});
