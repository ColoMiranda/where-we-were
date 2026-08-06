import { parseArgs } from "node:util";
import { normalizeRemote, rowToProject, slugify } from "@www/shared";
import { withDb } from "../db.ts";
import { CliError } from "../errors.ts";
import { getRemoteUrl } from "../git.ts";
import { resolveProjectForDir, writeMarker } from "../store.ts";

export async function init(argv: string[]): Promise<void> {
  const { values, positionals } = parseArgs({
    args: argv,
    options: {
      id: { type: "string" },
      json: { type: "boolean", default: false },
    },
    allowPositionals: true,
  });
  const name = positionals.join(" ").trim();
  if (!name) throw new CliError("Usage: www init <name> [--id <slug>]");

  const raw = getRemoteUrl();
  const remote = raw ? normalizeRemote(raw) : null;
  const baseSlug = values.id ?? slugify(name);
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(baseSlug)) {
    throw new CliError(
      `Invalid id "${baseSlug}" — lowercase letters, digits, and single hyphens only.`,
    );
  }

  await withDb(async (db) => {
    // Idempotency: marker or remote already maps this folder to a project.
    const existing = await resolveProjectForDir(db, process.cwd());
    if (existing) {
      throw new CliError(
        `This folder is already registered as "${existing.id}". www link ${existing.id} to relink, or pick a different folder.`,
      );
    }
    for (let n = 1; ; n++) {
      const id = n === 1 ? baseSlug : `${baseSlug}-${n}`;
      try {
        const r = await db.query(
          "insert into projects (id, name, remote) values ($1, $2, $3) returning *",
          [id, name, remote],
        );
        const project = rowToProject(r.rows[0]);
        try {
          writeMarker(process.cwd(), id);
        } catch {
          console.error(
            "Note: couldn't write the .www marker here — folder resolution will rely on the git remote.",
          );
        }
        if (values.json) {
          console.log(JSON.stringify(project, null, 2));
        } else {
          console.log(
            `Registered "${name}" as ${id}${remote ? ` (${remote})` : " (local — no remote)"}. Wrote .www marker${remote ? " — commit it so clones self-link" : ""}.`,
          );
        }
        return;
      } catch (e) {
        const pgErr = e as { code?: string; constraint?: string };
        const isIdCollision =
          pgErr.code === "23505" && pgErr.constraint === "projects_pkey";
        if (!isIdCollision || n >= 10) throw e;
      }
    }
  });
}
