import { parseArgs } from "node:util";
import { rowToTask } from "@www/shared";
import { withDb } from "../db.ts";
import { CliError } from "../errors.ts";
import { requireProject, resolveCwdProject, touchProject } from "../store.ts";

function parsePriority(v: string | undefined): number {
  if (v === undefined) return 3;
  if (!["1", "2", "3"].includes(v)) {
    throw new CliError(`Priority must be 1, 2, or 3 (got "${v}").`);
  }
  return Number(v);
}

export async function add(argv: string[]): Promise<void> {
  const { values, positionals } = parseArgs({
    args: argv,
    options: {
      priority: { type: "string", short: "p" },
      project: { type: "string" },
      idea: { type: "boolean", default: false },
      json: { type: "boolean", default: false },
    },
    allowPositionals: true,
  });
  const title = positionals.join(" ").trim();
  if (!title) throw new CliError("Usage: www add <title> [-p 1|2|3] [--project <id>] [--idea]");
  if (values.idea && values.project) {
    throw new CliError("--idea and --project are mutually exclusive.");
  }
  const priority = parsePriority(values.priority);
  const payload = { command: "add", title, priority, project: values.project ?? null };

  await withDb(async (db) => {
    let projectId: string | null = null;
    if (values.project) {
      projectId = (await requireProject(db, values.project)).id;
    } else if (!values.idea) {
      const cwdProject = await resolveCwdProject(db);
      projectId = cwdProject?.id ?? null;
      if (!projectId) {
        console.error(
          "Note: cwd repo isn't a registered project — saved to the idea bag. `www init <name>` to register it.",
        );
      }
    }
    const status = projectId ? "todo" : "idea";
    let r;
    try {
      r = await db.query(
        "insert into tasks (title, project_id, status, priority) values ($1, $2, $3, $4) returning *",
        [title, projectId, status, priority],
      );
    } catch (e) {
      throw new CliError(`Insert failed: ${(e as Error).message}`, payload);
    }
    if (projectId) await touchProject(db, projectId);
    const task = rowToTask(r.rows[0]);
    if (values.json) {
      console.log(JSON.stringify(task, null, 2));
    } else {
      console.log(
        `Added ${task.id.slice(0, 8)} [${task.status}] ${projectId ? `to ${projectId}` : "to the idea bag"}: ${title}`,
      );
    }
  });
}
