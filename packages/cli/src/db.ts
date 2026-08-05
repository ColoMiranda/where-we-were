import { homedir } from "node:os";
import { join } from "node:path";
import pg from "pg";
import { CliError } from "./errors.ts";

const ENV_VAR = "WWW_DATABASE_URL";
const ENV_FILE = join(homedir(), ".config", "www", ".env");

function databaseUrl(): string {
  if (!process.env[ENV_VAR]) {
    try {
      process.loadEnvFile(ENV_FILE);
    } catch (e) {
      if ((e as NodeJS.ErrnoException).code !== "ENOENT") throw e;
    }
  }
  const url = process.env[ENV_VAR];
  if (!url) {
    throw new CliError(
      `${ENV_VAR} is not set. Export it in your shell or put it in ${ENV_FILE}:\n` +
        `  ${ENV_VAR}="postgresql://postgres.<ref>:<password>@<region>.pooler.supabase.com:6543/postgres?uselibpqcompat=true&sslmode=require"`,
    );
  }
  return url;
}

export async function connect(): Promise<pg.Client> {
  const client = new pg.Client({ connectionString: databaseUrl() });
  try {
    await client.connect();
  } catch (e) {
    throw new CliError(
      `Could not reach the database (offline?): ${(e as Error).message}`,
    );
  }
  return client;
}

/** Open a connection, run fn, always close. Errors pass through. */
export async function withDb<T>(fn: (db: pg.Client) => Promise<T>): Promise<T> {
  const db = await connect();
  try {
    return await fn(db);
  } finally {
    await db.end();
  }
}
