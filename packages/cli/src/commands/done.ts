import { parseArgs } from "node:util";
import { rowToWin } from "@www/shared";
import { withDb } from "../db.ts";
import { CliError } from "../errors.ts";
import { casUpdateTask, findTask, touchProject } from "../store.ts";

export async function done(argv: string[]): Promise<void> {
  const { values, positionals } = parseArgs({
    args: argv,
    options: {
      win: { type: "string" },
      json: { type: "boolean", default: false },
    },
    allowPositionals: true,
  });
  const idArg = positionals[0];
  if (!idArg || positionals.length !== 1) {
    throw new CliError('Usage: www done <task-id> [--win "<one line>"]');
  }
  if (values.win !== undefined && !values.win.trim()) {
    throw new CliError("--win needs a non-empty line.");
  }
  const payload = { command: "done", taskId: idArg, win: values.win ?? null };

  await withDb(async (db) => {
    const { task, cas } = await findTask(db, idArg);
    if (values.win !== undefined && !task.projectId) {
      throw new CliError(
        "--win needs a task that belongs to a project (wins are per-project).",
        payload,
      );
    }

    await db.query("begin");
    try {
      const updated = await casUpdateTask(db, task.id, cas, { status: "done" }, payload);
      let win = null;
      if (values.win !== undefined) {
        const r = await db.query(
          "insert into wins (project_id, line) values ($1, $2) returning *",
          [task.projectId, values.win],
        );
        win = rowToWin(r.rows[0]);
      }
      if (task.projectId) await touchProject(db, task.projectId);
      await db.query("commit");

      if (values.json) {
        console.log(JSON.stringify({ task: updated, win }, null, 2));
      } else {
        console.log(
          `Done ${updated.id.slice(0, 8)}: ${updated.title}${win ? `\nWin: ${win.line}` : ""}`,
        );
      }
    } catch (e) {
      await db.query("rollback");
      throw e;
    }
  });
}
