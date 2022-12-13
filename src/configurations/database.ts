import { PrismaClient } from "@prisma/client";

export let prisma: PrismaClient;
export function connect_database(): void {
  prisma = new PrismaClient();
}
