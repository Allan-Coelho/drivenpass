import app, { initialize_server } from "@/app";
import faker from "@faker-js/faker";
import { prisma } from "@/configurations";
import httpStatus from "http-status";
import supertest from "supertest";
import { create_user } from "../factories";
import { clean_database } from "../helpers";
import { exclude } from "@/utilities/prisma";

beforeAll(async () => {
  await initialize_server();
});

beforeEach(async () => {
  await clean_database();
});
const server = supertest(app);

describe("POST /authentication/sign-in", () => {
  it("should respond with status 400 when body is not given", async () => {
    const response = await server.post("/authentication/sign-in");

    expect(response.status).toBe(httpStatus.BAD_REQUEST);
  });

  it("should respond with status 400 when body is not valid", async () => {
    const invalidBody = { [faker.lorem.word()]: faker.lorem.word() };

    const response = await server
      .post("/authentication/sign-in")
      .send(invalidBody);

    expect(response.status).toBe(httpStatus.BAD_REQUEST);
  });

  describe("when body is valid", () => {
    const generateValidBody = () => ({
      email: faker.internet.email(),
      password: faker.internet.password(10),
    });

    it("should respond with status 401 if there is no user for given email", async () => {
      const body = generateValidBody();

      const response = await server.post("/authentication/sign-in").send(body);

      expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it("should respond with status 401 if there is a user for given email but password is not correct", async () => {
      const body = generateValidBody();
      await create_user(body);

      const response = await server.post("/authentication/sign-in").send({
        ...body,
        password: faker.internet.password(10),
      });

      expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    describe("when credentials are valid", () => {
      it("should respond with status 200", async () => {
        const body = generateValidBody();
        await create_user(body);

        const response = await server
          .post("/authentication/sign-in")
          .send(body);

        expect(response.status).toBe(httpStatus.OK);
      });

      it("should respond with user data", async () => {
        const body = generateValidBody();
        const user = await create_user(body);

        const response = await server
          .post("/authentication/sign-in")
          .send(body);

        expect(response.body.user).toEqual({
          id: user.id,
          email: user.email,
        });
      });

      it("should respond with session token", async () => {
        const body = generateValidBody();
        await create_user(body);

        const response = await server
          .post("/authentication/sign-in")
          .send(body);

        expect(response.body.token).toBeDefined();
      });
    });
  });
});

describe("POST /authentication/sign-up", () => {
  it("should respond with status 400 when body is not given", async () => {
    const response = await server.post("/authentication/sign-up");

    expect(response.status).toBe(httpStatus.BAD_REQUEST);
  });

  it("should respond with status 400 when body is not valid", async () => {
    const invalidBody = { [faker.lorem.word()]: faker.lorem.word() };

    const response = await server
      .post("/authentication/sign-up")
      .send(invalidBody);

    expect(response.status).toBe(httpStatus.BAD_REQUEST);
  });

  describe("when body is valid", () => {
    const generateValidBody = () => ({
      email: faker.internet.email(),
      password: faker.internet.password(10),
    });

    it("should respond with status 409 if email already is in use", async () => {
      const body = generateValidBody();
      await create_user(body);
      const response = await server.post("/authentication/sign-up").send(body);

      expect(response.status).toBe(httpStatus.CONFLICT);
    });

    describe("when credentials are valid", () => {
      it("should respond with status 200", async () => {
        const body = generateValidBody();
        const response = await server
          .post("/authentication/sign-up")
          .send(body);

        const result = await prisma.user.findFirst({
          where: {
            email: body.email,
          },
        });

        expect(response.status).toBe(httpStatus.OK);
        expect(exclude(result, "id")).toEqual(body);
      });
    });
  });
});
