import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const globalForDb = globalThis as unknown as {
  pool: pg.Pool | undefined;
};

function createPool(): pg.Pool {
  if (process.env.NODE_ENV !== "production" && globalForDb.pool) {
    return globalForDb.pool;
  }
  const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
  });
  if (process.env.NODE_ENV !== "production") {
    globalForDb.pool = pool;
  }
  return pool;
}

export const db = drizzle(createPool(), { schema });

export * from "./schema";
export { eq, and, or, like, desc, asc } from "drizzle-orm";
