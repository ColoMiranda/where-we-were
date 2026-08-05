import { parseArgs } from "node:util";
import type { Project, TaskStatus, WwwTask } from "@www/shared";
import { rowToProject, rowToTask, TASK_STATUSES } from "@www/shared";
import { withDb } from "../db.ts";
import { CliError } from "../errors.ts";
import { taskLine } from "../format.ts";
import { requireProject, resolveCwdProject } from "../store.ts";

/** priority asc, ties broken by recency (spec). */
function byPriorityThenRecency(a: WwwTask, b: WwwTask): number {
  return (
    a.priority - b.priority ||
    new Date(b.lastTouched).getTime() - new Date(a.lastTouched).getTime()
  );
}

export async function list(argv: string[]): Promise<void> {
  const { values } = parseArgs({
    args: argv,
    options: {
      project: { type: "string" },
      status: { type: "string", multiple: true },
      idea: { type: "boolean", default: false },
      all: { type: "boolean", default: false },
      json: { type: "boolean", default: false },
    },
    allowPositionals: false,
  });
  for (const s of values.status ?? []) {
    if (!TASK_STATUSES.includes(s as TaskStatus)) {
      throw new CliError(
        `Unknown status "${s}". One of: ${TASK_STATUSES.join(", ")}.`,
      );
    }
  }
  if (values.idea && values.project) {
    throw new CliError("--idea and --project are mutually exclusive.");
  }

  await withDb(async (db) => {
    const where: string[] = [];
    const params: unknown[] = [];
    if (values.idea) {
      where.push("project_id is null");
    } else if (values.project) {
      await requireProject(db, values.project);
      where.push(`project_id = $${params.push(values.project)}`);
    } else {
      const cwdProject = await resolveCwdProject(db);
      if (cwdProject) where.push(`project_id = $${params.push(cwdProject.id)}`);
    }
    if (values.status?.length) {
      where.push(`status = any($${params.push(values.status)})`);
    } else if (!values.all) {
      where.push("status <> 'done'");
    }

    const sql = `select * from tasks ${where.length ? `where ${where.join(" and ")}` : ""}`;
    const tasks = (await db.query(sql, params)).rows
      .map(rowToTask)
      .sort(byPriorityThenRecency);

    if (values.json) {
      console.log(JSON.stringify(tasks, null, 2));
      return;
    }
    if (tasks.length === 0) {
      console.log("Nothing here.");
      return;
    }

    const scoped = values.idea || values.project || where.some((w) => w.startsWith("project_id ="));
    if (scoped) {
      for (const t of tasks) console.log(taskLine(t));
      return;
    }

    // Global view: group by project, idea bag last.
    const projects = new Map<string, Project>(
      (await db.query("select * from projects")).rows
        .map(rowToProject)
        .map((p) => [p.id, p]),
    );
    const groups = new Map<string | null, WwwTask[]>();
    for (const t of tasks) {
      const key = t.projectId;
      (groups.get(key) ?? groups.set(key, []).get(key)!).push(t);
    }
    for (const [projectId, group] of groups) {
      if (projectId === null) continue;
      console.log(`\n${projects.get(projectId)?.name ?? projectId} (${projectId})`);
      for (const t of group) console.log(`  ${taskLine(t)}`);
    }
    const ideas = groups.get(null);
    if (ideas) {
      console.log("\nidea bag");
      for (const t of ideas) console.log(`  ${taskLine(t)}`);
    }
  });
}
