import app, { initialize_server } from "@/server";
import faker from "@faker-js/faker";
import { prisma } from "@/configurations";
import httpStatus from "http-status";
import * as jwt from "jsonwebtoken";
import supertest from "supertest";
import { create_user } from "../factories";
import { clean_database, generate_valid_token } from "../helpers";
import { create_network, create_network_body } from "../factories/networks";
import {
  create_credential,
  create_credential_body,
} from "../factories/credentials";
import { exclude } from "@/utilities/prisma";
import cryptr from "@/configurations/encryption";
import { nextTick } from "process";

beforeAll(async () => {
  await initialize_server();
});

beforeEach(async () => {
  await clean_database();
});

const server = supertest(app);
const route = "/networks";

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
    it("should respond with status 200 and the network if an valid network is sent", async () => {
      const user_without_session = await create_user();
      const token = await generate_valid_token(user_without_session);
      const network_body = create_network_body();
      const response = await server
        .post(route)
        .send(network_body)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.CREATED);
      expect(exclude(response.body, "id", "userId")).toEqual(
        exclude(network_body, "password")
      );
    });

    it("should respond with status 400 if credential body is invalid", async () => {
      const user_without_session = await create_user();
      const token = await generate_valid_token(user_without_session);
      const network_body = create_network_body();
      network_body.password = "";

      const response = await server
        .post(route)
        .send(network_body)
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
    it("should respond with status 200 and the networks with decrypted passwords if the user has networks", async () => {
      const user_without_session = await create_user();
      const token = await generate_valid_token(user_without_session);
      const network = await create_network(user_without_session.id);
      const response = await server
        .get(route)
        .send(exclude(network, "id", "userId"))
        .set("Authorization", `Bearer ${token}`);

      network.password = cryptr.decrypt(network.password);
      expect(response.status).toBe(httpStatus.OK);
      expect(response.body).toEqual(
        expect.arrayContaining([expect.objectContaining(network)])
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
    it("should respond with status 200 and the network with decrypted password if the user has networks", async () => {
      const user_without_session = await create_user();
      const token = await generate_valid_token(user_without_session);
      const network = await create_network(user_without_session.id);
      const response = await server
        .get(`${route}/${network.id}`)
        .set("Authorization", `Bearer ${token}`);

      network.password = cryptr.decrypt(network.password);
      expect(response.status).toBe(httpStatus.OK);
      expect(response.body).toEqual(expect.objectContaining(network));
    });

    it("should respond with status 404 if the network does not exists", async () => {
      const user_without_session = await create_user();
      const token = await generate_valid_token(user_without_session);
      const response = await server
        .get(`${route}/${Number(faker.random.numeric(2))}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });

    it("should respond with status 401 if the network isn't of the user", async () => {
      const user_without_session = await create_user();
      const user = await create_user();
      const token = await generate_valid_token(user_without_session);
      const network = await create_network(user.id);
      const response = await server
        .get(`${route}/${network.id}`)
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

describe(`DELETE ${route}/:id`, () => {
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
    it("should respond with status 200 and delete the network if the id is valid", async () => {
      const user_without_session = await create_user();
      const token = await generate_valid_token(user_without_session);
      const network = await create_network(user_without_session.id);
      const response = await server
        .delete(`${route}/${network.id}`)
        .set("Authorization", `Bearer ${token}`);
      const network_at_database = await prisma.network.findFirst({
        where: {
          id: network.id,
        },
      });

      expect(response.status).toBe(httpStatus.OK);
      expect(network_at_database).toEqual(null);
    });

    it("should respond with status 404 if the network does not exists", async () => {
      const user_without_session = await create_user();
      const token = await generate_valid_token(user_without_session);
      const response = await server
        .delete(`${route}/0`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });

    it("should respond with status 401 if isn't of the user", async () => {
      const user_without_session = await create_user();
      const user = await create_user();
      const token = await generate_valid_token(user_without_session);
      const network = await create_network(user.id);
      const response = await server
        .delete(`${route}/${network.id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it("should respond with status 400 if the id is invalid", async () => {
      const user_without_session = await create_user();
      const token = await generate_valid_token(user_without_session);
      const response = await server
        .delete(`${route}/${faker.random.word()}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.BAD_REQUEST);
    });
  });
});
