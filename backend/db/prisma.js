import "../env.js";
import { PrismaClient } from "../generated/prisma/client.ts";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

let prismaInstance = null;

export async function getPrisma() {
  if (prismaInstance) {
    return prismaInstance;
  }

  const adapter = new PrismaMariaDb({
    host: process.env.DATABASE_HOST,
    port: process.env.DATABASE_PORT,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    connectTimeout: 5_000, // increase from default 1s
  });

  prismaInstance = new PrismaClient({ adapter });

  return prismaInstance;
}