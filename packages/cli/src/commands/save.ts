import { parseArgs } from "node:util";
import type { Blocker, TaskContext, TaskStatus } from "@www/shared";
import { TASK_STATUSES } from "@www/shared";
import { withDb } from "../db.ts";
import { CliError } from "../errors.ts";
import { getBranch, getRemoteUrl, getSha } from "../git.ts";
import { casUpdateTask, findTask, touchProject } from "../store.ts";

function buildBlocker(question: string, rawOptions: string[]): Blocker {
  if (rawOptions.length === 1 || rawOptions.length > 3) {
    throw new CliError(
      "A blocker takes 2-3 options (or none, for a free-text question).",
    );
  }
  return {
    question,
    options: rawOptions.map((raw, i) => {
      const recommended = raw.endsWith(":recommended");
      const label = recommended ? raw.slice(0, -":recommended".length) : raw;
      if (!label.trim()) throw new CliError("Blocker option label is empty.");
      return { id: `o${i + 1}`, label, ...(recommended ? { recommended } : {}) };
    }),
  };
}

export async function save(argv: string[]): Promise<void> {
  const { values, positionals } = parseArgs({
    args: argv,
    options: {
      title: { type: "string" },
      status: { type: "string" },
      priority: { type: "string" },
      "next-step": { type: "string" },
      decision: { type: "string", multiple: true },
      file: { type: "string", multiple: true },
      sha: { type: "string" },
      branch: { type: "string" },
      repo: { type: "string" },
      "blocker-question": { type: "string" },
      "blocker-option": { type: "string", multiple: true },
      "clear-blocker": { type: "boolean", default: false },
      "session-label": { type: "string" },
      "status-note": { type: "string" },
      json: { type: "boolean", default: false },
    },
    allowPositionals: true,
  });
  const idArg = positionals[0];
  if (!idArg || positionals.length !== 1) {
    throw new CliError("Usage: www save <task-id> [flags] — see README for flags.");
  }
  if (values.status && !TASK_STATUSES.includes(values.status as TaskStatus)) {
    throw new CliError(
      `Unknown status "${values.status}". One of: ${TASK_STATUSES.join(", ")}.`,
    );
  }
  if (values.priority && !["1", "2", "3"].includes(values.priority)) {
    throw new CliError(`Priority must be 1, 2, or 3 (got "${values.priority}").`);
  }
  if (values["blocker-option"]?.length && !values["blocker-question"]) {
    throw new CliError("--blocker-option requires --blocker-question.");
  }
  if (values["blocker-question"] && values["clear-blocker"]) {
    throw new CliError("--blocker-question and --clear-blocker are mutually exclusive.");
  }

  const contextFlagged =
    values["next-step"] !== undefined ||
    values.decision?.length ||
    values.file?.length ||
    values.sha !== undefined ||
    values.branch !== undefined ||
    values.repo !== undefined;
  const anyChange =
    contextFlagged ||
    values.title !== undefined ||
    values.status !== undefined ||
    values.priority !== undefined ||
    values["blocker-question"] !== undefined ||
    values["clear-blocker"] ||
    values["session-label"] !== undefined ||
    values["status-note"] !== undefined;
  if (!anyChange) throw new CliError("Nothing to save — pass at least one flag.");

  const payload = { command: "save", taskId: idArg, changes: values };

  await withDb(async (db) => {
    const { task, cas } = await findTask(db, idArg);
    const columns: Record<string, unknown> = {};

    if (values.title !== undefined) {
      if (!values.title.trim()) throw new CliError("--title cannot be empty.");
      columns.title = values.title;
    }
    if (values.priority !== undefined) columns.priority = Number(values.priority);
    if (values["session-label"] !== undefined) {
      columns.session_label = values["session-label"];
    }

    if (contextFlagged) {
      const ctx: TaskContext = { ...task.context };
      if (values.repo !== undefined) ctx.repo = values.repo;
      if (values.branch !== undefined) ctx.branch = values.branch;
      if (values.sha !== undefined) ctx.sha = values.sha;
      if (values["next-step"] !== undefined) ctx.nextStep = values["next-step"];
      if (values.decision?.length) {
        ctx.decisions = [...(ctx.decisions ?? []), ...values.decision];
      }
      if (values.file?.length) {
        ctx.files = [...new Set([...(ctx.files ?? []), ...values.file])];
      }
      // Anchor to the cwd repo for anything not given explicitly or already set.
      ctx.repo ??= getRemoteUrl() ?? undefined;
      ctx.branch ??= getBranch() ?? undefined;
      ctx.sha ??= getSha() ?? undefined;
      columns.context = JSON.stringify(ctx);
    }

    if (values["clear-blocker"]) columns.blocker = null;
    if (values["blocker-question"]) {
      columns.blocker = JSON.stringify(
        buildBlocker(values["blocker-question"], values["blocker-option"] ?? []),
      );
      if (values.status === undefined) columns.status = "blocked-needs-decision";
    }
    if (values.status !== undefined) columns.status = values.status;

    if (values["status-note"] !== undefined) {
      if (!task.projectId) {
        throw new CliError(
          "--status-note needs a task that belongs to a project (this one is in the idea bag).",
          payload,
        );
      }
      await db.query("update projects set status_note = $2 where id = $1", [
        task.projectId,
        values["status-note"],
      ]);
    }

    const updated = Object.keys(columns).length
      ? await casUpdateTask(db, task.id, cas, columns, payload)
      : task;
    if (task.projectId) await touchProject(db, task.projectId);

    if (values.json) {
      console.log(JSON.stringify(updated, null, 2));
    } else {
      console.log(`Saved ${updated.id.slice(0, 8)} [${updated.status}]: ${updated.title}`);
    }
  });
}
