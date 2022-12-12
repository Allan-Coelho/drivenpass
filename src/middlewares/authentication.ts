import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import * as jwt from "jsonwebtoken";
import { unauthorizedError } from "@/errors";
import { prisma } from "@/configurations";

export async function authentication(
  request: AuthenticatedRequest,
  response: Response,
  next: NextFunction
) {
  const authHeader = request.header("Authorization");
  if (!authHeader) return generateUnauthorizedResponse(response);

  const token = authHeader.split(" ")[1];
  if (!token) return generateUnauthorizedResponse(response);

  try {
    const { user_id } = jwt.verify(token, process.env.JWT_SECRET) as JWTPayload;

    const session = await prisma.session.findFirst({
      where: {
        token,
      },
    });

    if (!session) return generateUnauthorizedResponse(response);

    request.user_id = user_id;

    return next();
  } catch (err) {
    return generateUnauthorizedResponse(response);
  }
}

function generateUnauthorizedResponse(response: Response) {
  response.status(httpStatus.UNAUTHORIZED).send(unauthorizedError());
}

export type AuthenticatedRequest = Request & JWTPayload;

type JWTPayload = {
  user_id: number;
};
