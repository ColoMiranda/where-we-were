import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import type pg from "pg";
import type { Project, WwwTask } from "@www/shared";
import { normalizeRemote, rowToProject, rowToTask } from "@www/shared";
import { CliError } from "./errors.ts";
import { getRemoteUrl } from "./git.ts";

const MARKER = ".www";
const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/**
 * Nearest .www marker walking up from dir — the folder→project link that
 * needs no git. A malformed marker is treated as absent, never guessed at.
 */
export function markerProjectId(dir: string): string | null {
  let current = dir;
  for (;;) {
    try {
      const id = readFileSync(join(current, MARKER), "utf8").trim();
      return SLUG.test(id) ? id : null;
    } catch {
      const parent = dirname(current);
      if (parent === current) return null;
      current = parent;
    }
  }
}

export function writeMarker(dir: string, id: string): void {
  writeFileSync(join(dir, MARKER), `${id}\n`);
}

/**
 * A task plus its updated_at as Postgres text — the CAS token. JS Date is
 * millisecond-precision while timestamptz keeps microseconds, so the token
 * must round-trip as text or every compare-and-set would look stale.
 */
export interface TaskWithCas {
  task: WwwTask;
  cas: string;
}

/** Find one task by full id or unique prefix (min 4 chars). */
export async function findTask(
  db: pg.Client,
  idOrPrefix: string,
): Promise<TaskWithCas> {
  if (!/^[0-9a-f-]{4,36}$/i.test(idOrPrefix)) {
    throw new CliError(`"${idOrPrefix}" is not a task id or id prefix.`);
  }
  const r = await db.query(
    "select *, updated_at::text as updated_at_cas from tasks where id::text like $1 || '%'",
    [idOrPrefix.toLowerCase()],
  );
  if (r.rowCount === 0) throw new CliError(`No task matches "${idOrPrefix}".`);
  if ((r.rowCount ?? 0) > 1) {
    const ids = r.rows.map((row) => String(row.id).slice(0, 8)).join(", ");
    throw new CliError(`"${idOrPrefix}" is ambiguous — matches: ${ids}.`);
  }
  const row = r.rows[0];
  return { task: rowToTask(row), cas: String(row.updated_at_cas) };
}

/**
 * Compare-and-set update. `columns` keys are snake_case column names.
 * Fails loud on a stale row and attaches `payload` so nothing is lost.
 */
export async function casUpdateTask(
  db: pg.Client,
  id: string,
  cas: string,
  columns: Record<string, unknown>,
  payload: unknown,
): Promise<WwwTask> {
  const keys = Object.keys(columns);
  const sets = keys.map((k, i) => `${k} = $${i + 3}`);
  sets.push("last_touched = now()");
  const r = await db.query(
    `update tasks set ${sets.join(", ")} where id = $1 and updated_at = $2::timestamptz returning *`,
    [id, cas, ...keys.map((k) => columns[k])],
  );
  if (r.rowCount === 1) return rowToTask(r.rows[0]);
  const exists = await db.query("select 1 from tasks where id = $1", [id]);
  if (exists.rowCount === 0) {
    throw new CliError(`Task ${id} no longer exists.`, payload);
  }
  throw new CliError(
    `Stale write: task ${id.slice(0, 8)} changed since it was read. Re-run against fresh state.`,
    payload,
  );
}

/**
 * Project registered for a directory: .www marker first (git optional),
 * then git-remote lookup. A marker pointing at a deleted project falls
 * through to the remote rather than failing.
 */
export async function resolveProjectForDir(
  db: pg.Client,
  dir: string,
): Promise<Project | null> {
  const markerId = markerProjectId(dir);
  if (markerId) {
    const r = await db.query("select * from projects where id = $1", [markerId]);
    if (r.rowCount === 1) return rowToProject(r.rows[0]);
  }
  const raw = getRemoteUrl(dir);
  if (!raw) return null;
  const r = await db.query("select * from projects where remote = $1", [
    normalizeRemote(raw),
  ]);
  return r.rowCount === 1 ? rowToProject(r.rows[0]) : null;
}

export async function resolveCwdProject(
  db: pg.Client,
): Promise<Project | null> {
  return resolveProjectForDir(db, process.cwd());
}

export async function requireProject(
  db: pg.Client,
  id: string,
): Promise<Project> {
  const r = await db.query("select * from projects where id = $1", [id]);
  if (r.rowCount === 0) {
    throw new CliError(`No project "${id}". Run \`www init <name>\` first.`);
  }
  return rowToProject(r.rows[0]);
}

export async function touchProject(db: pg.Client, id: string): Promise<void> {
  await db.query("update projects set last_touched = now() where id = $1", [id]);
}
