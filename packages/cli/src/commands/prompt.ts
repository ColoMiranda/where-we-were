import { parseArgs } from "node:util";
import { taskToPrompt } from "@www/shared";
import { withDb } from "../db.ts";
import { CliError } from "../errors.ts";
import { findTask, requireProject } from "../store.ts";

export async function prompt(argv: string[]): Promise<void> {
  const { values, positionals } = parseArgs({
    args: argv,
    options: {
      json: { type: "boolean", default: false },
    },
    allowPositionals: true,
  });
  const idArg = positionals[0];
  if (!idArg || positionals.length !== 1) {
    throw new CliError("Usage: www prompt <task-id>");
  }

  await withDb(async (db) => {
    const { task } = await findTask(db, idArg);
    const project = task.projectId
      ? await requireProject(db, task.projectId)
      : undefined;
    const text = taskToPrompt(task, project);
    console.log(values.json ? JSON.stringify({ prompt: text }, null, 2) : text);
  });
}
