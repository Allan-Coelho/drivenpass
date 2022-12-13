import app, { initialize_server } from "@/server";
import faker from "@faker-js/faker";
import { prisma } from "@/configurations";
import httpStatus from "http-status";
import * as jwt from "jsonwebtoken";
import supertest from "supertest";
import { create_user } from "../factories";
import { clean_database, generate_valid_token } from "../helpers";
import {
  create_credential,
  create_credential_body,
} from "../factories/credentials";
import { exclude } from "@/utilities/prisma";
import cryptr from "@/configurations/encryption";

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

  describe("when token is valid", () => {
    it("should respond with status 200 and the credential if an valid credential is sent", async () => {
      const user_without_session = await create_user();
      const token = await generate_valid_token(user_without_session);
      const credential_body = create_credential_body();
      const response = await server
        .post(route)
        .send(credential_body)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.CREATED);
      expect(exclude(response.body, "id", "userId")).toEqual(
        exclude(credential_body, "password")
      );
    });

    it("should respond with status 409 if already has an credential with the same title", async () => {
      const user_without_session = await create_user();
      const token = await generate_valid_token(user_without_session);
      const credential = await create_credential(user_without_session.id);
      const response = await server
        .post(route)
        .send(exclude(credential, "id", "userId"))
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.CONFLICT);
    });

    it("should respond with status 400 if credential body is invalid", async () => {
      const user_without_session = await create_user();
      const token = await generate_valid_token(user_without_session);
      const credential_body = create_credential_body();
      credential_body.password = "";

      const response = await server
        .post(route)
        .send(credential_body)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.BAD_REQUEST);
    });
  });
});

describe(`GET ${route}`, () => {
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

  describe("when token is valid", () => {
    it("should respond with status 200 and the credentials with decrypted password if the user has credentials", async () => {
      const user_without_session = await create_user();
      const token = await generate_valid_token(user_without_session);
      const credential = await create_credential(user_without_session.id);
      const response = await server
        .get(route)
        .send(exclude(credential, "id", "userId"))
        .set("Authorization", `Bearer ${token}`);

      credential.password = cryptr.decrypt(credential.password);
      expect(response.status).toBe(httpStatus.OK);
      expect(response.body).toEqual(
        expect.arrayContaining([expect.objectContaining(credential)])
      );
    });
  });
});

describe(`GET ${route}/:id`, () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await server.get(`${route}/:id`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();

    const response = await server
      .get(`${route}/:id`)
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
      .get(`${route}/:id`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe("when token is valid", () => {
    it("should respond with status 200 and the credential with decrypted password if the user has credentials", async () => {
      const user_without_session = await create_user();
      const token = await generate_valid_token(user_without_session);
      const credential = await create_credential(user_without_session.id);
      const response = await server
        .get(`${route}/${credential.id}`)
        .send(exclude(credential, "id", "userId"))
        .set("Authorization", `Bearer ${token}`);

      credential.password = cryptr.decrypt(credential.password);
      expect(response.status).toBe(httpStatus.OK);
      expect(response.body).toEqual(expect.objectContaining(credential));
    });

    it("should respond with status 404 if the credential does not exists", async () => {
      const user_without_session = await create_user();
      const token = await generate_valid_token(user_without_session);
      const response = await server
        .get(`${route}/${Number(faker.random.numeric())}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });

    it("should respond with status 401 if isn't of the user", async () => {
      const user_without_session = await create_user();
      const user = await create_user();
      const token = await generate_valid_token(user_without_session);
      const credential = await create_credential(user.id);
      const response = await server
        .get(`${route}/${credential.id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it("should respond with status 400 if the id is invalid", async () => {
      const user_without_session = await create_user();
      const token = await generate_valid_token(user_without_session);
      const response = await server
        .get(`${route}/${faker.random.word()}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.BAD_REQUEST);
    });
  });
});
