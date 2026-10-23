import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

export type Database = ReturnType<typeof createDatabase>;

function createDatabase() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Add it to .env.local (see .env.example).",
    );
  }
  const client = neon(url);
  return drizzle({ client, schema });
}

let cached: Database | null = null;

export function getDb(): Database {
  if (!cached) {
    cached = createDatabase();
  }
  return cached;
}

export { schema };
