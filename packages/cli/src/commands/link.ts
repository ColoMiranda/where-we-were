import { parseArgs } from "node:util";
import { normalizeRemote } from "@www/shared";
import { withDb } from "../db.ts";
import { CliError } from "../errors.ts";
import { getRemoteUrl } from "../git.ts";
import { requireProject, writeMarker } from "../store.ts";

/**
 * Attach the cwd folder to an existing project: writes the .www marker,
 * and — if the folder has a git remote the project doesn't know yet —
 * adopts it onto the project row (the "folder project grew a repo" path).
 */
export async function link(argv: string[]): Promise<void> {
  const { values, positionals } = parseArgs({
    args: argv,
    options: { json: { type: "boolean", default: false } },
    allowPositionals: true,
  });
  const id = positionals[0];
  if (!id || positionals.length !== 1) {
    throw new CliError("Usage: www link <project-id>");
  }

  await withDb(async (db) => {
    let project = await requireProject(db, id);

    const raw = getRemoteUrl();
    const remote = raw ? normalizeRemote(raw) : null;
    if (remote && project.remote === null) {
      const owner = await db.query(
        "select id from projects where remote = $1 and id <> $2",
        [remote, project.id],
      );
      if ((owner.rowCount ?? 0) > 0) {
        throw new CliError(
          `This folder's remote (${remote}) is already registered as "${owner.rows[0].id}".`,
        );
      }
      await db.query("update projects set remote = $2 where id = $1", [
        project.id,
        remote,
      ]);
      project = { ...project, remote };
    } else if (remote && project.remote && project.remote !== remote) {
      console.error(
        `Note: project is linked to ${project.remote}, this folder's remote is ${remote}. Marker written; remote left unchanged.`,
      );
    }

    writeMarker(process.cwd(), project.id);

    if (values.json) {
      console.log(JSON.stringify(project, null, 2));
    } else {
      console.log(
        `Linked this folder to ${project.id}${project.remote ? ` (${project.remote})` : " (local)"}. Wrote .www marker.`,
      );
    }
  });
}
