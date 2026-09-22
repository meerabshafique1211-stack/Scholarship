import { PrismaClient } from "@prisma/client";

const g = globalThis as unknown as { __prisma?: PrismaClient };

/** The site runs without a database: scholarship results are then honestly empty. */
export function hasDb(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

export function db(): PrismaClient {
  if (!g.__prisma) g.__prisma = new PrismaClient();
  return g.__prisma;
}
