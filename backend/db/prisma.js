import "../env.js";
import { PrismaClient } from "../generated/prisma/client.ts";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { Connector } from "@google-cloud/cloud-sql-connector";

let prismaInstance = null;

async function resolveDatabaseConfig() {
  if (process.env.DB_MODE !== "cloud") {
    return {
      host: process.env.DATABASE_HOST,
      user: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
    };
  }

  const connector = new Connector();

  const opts = await connector.getOptions({
    instanceConnectionName: process.env.INSTANCE_CONNECTION_NAME,
    ipType:
      process.env.PRIVATE_IP === "1" || process.env.PRIVATE_IP === "true"
        ? "PRIVATE"
        : "PUBLIC",
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    db: process.env.DB_NAME,
  });

  return {
    host: opts.host,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
  };
}

export async function getPrisma() {
  if (prismaInstance) {
    return prismaInstance;
  }

  const dbConfig = await resolveDatabaseConfig();

  const adapter = new PrismaMariaDb(dbConfig);

  prismaInstance = new PrismaClient({ adapter });

  return prismaInstance;
}