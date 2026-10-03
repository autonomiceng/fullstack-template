import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

/**
 * Creates a pool-backed database without applying migrations.
 * The caller must await close() during shutdown to release the pool.
 */
export function createDatabase(url: string) {
  const pool = new Pool({
    connectionString: url,
    connectionTimeoutMillis: 3000,
  });
  const db = drizzle(pool, { schema });
  return { db, close: () => pool.end() };
}

export type Database = NodePgDatabase<typeof schema>;
