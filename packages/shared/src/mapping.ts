import type {
  Blocker,
  BlockerOption,
  Priority,
  Project,
  TaskContext,
  TaskStatus,
  Win,
  WwwTask,
} from "./types.ts";
import { TASK_STATUSES } from "./types.ts";

/** A raw DB row: snake_case columns, timestamptz as Date or ISO string. */
export type Row = Record<string, unknown>;

function iso(v: unknown, column: string): string {
  if (v instanceof Date) return v.toISOString();
  if (typeof v === "string" && v) return new Date(v).toISOString();
  throw new Error(`Invalid timestamp in column "${column}": ${String(v)}`);
}

function str(v: unknown, column: string): string {
  if (typeof v !== "string") {
    throw new Error(`Expected string in column "${column}", got ${typeof v}`);
  }
  return v;
}

function isStringArray(v: unknown): v is string[] {
  return Array.isArray(v) && v.every((x) => typeof x === "string");
}

/** Validate the `context` jsonb blob; drop unknown/malformed fields. */
export function parseContext(v: unknown): TaskContext | undefined {
  if (v === null || v === undefined) return undefined;
  if (typeof v !== "object" || Array.isArray(v)) {
    throw new Error(`Malformed context jsonb: ${JSON.stringify(v)}`);
  }
  const o = v as Record<string, unknown>;
  const out: TaskContext = {};
  if (typeof o.repo === "string") out.repo = o.repo;
  if (typeof o.branch === "string") out.branch = o.branch;
  if (isStringArray(o.files)) out.files = o.files;
  if (typeof o.sha === "string") out.sha = o.sha;
  if (isStringArray(o.decisions)) out.decisions = o.decisions;
  if (typeof o.nextStep === "string") out.nextStep = o.nextStep;
  return Object.keys(out).length ? out : undefined;
}

/** Validate the `blocker` jsonb blob; throws on a malformed shape. */
export function parseBlocker(v: unknown): Blocker | undefined {
  if (v === null || v === undefined) return undefined;
  const o = v as { question?: unknown; options?: unknown };
  if (
    typeof o !== "object" ||
    typeof o.question !== "string" ||
    !Array.isArray(o.options)
  ) {
    throw new Error(`Malformed blocker jsonb: ${JSON.stringify(v)}`);
  }
  const options: BlockerOption[] = o.options.map((opt, i) => {
    const b = opt as { id?: unknown; label?: unknown; recommended?: unknown };
    if (typeof b.id !== "string" || typeof b.label !== "string") {
      throw new Error(`Malformed blocker option at index ${i}`);
    }
    return {
      id: b.id,
      label: b.label,
      ...(b.recommended === true ? { recommended: true } : {}),
    };
  });
  return { question: o.question, options };
}

export function rowToTask(row: Row): WwwTask {
  const status = str(row.status, "status") as TaskStatus;
  if (!TASK_STATUSES.includes(status)) {
    throw new Error(`Unknown task status "${status}"`);
  }
  const priority = Number(row.priority) as Priority;
  if (![1, 2, 3].includes(priority)) {
    throw new Error(`Priority out of range: ${String(row.priority)}`);
  }
  const context = parseContext(row.context);
  const blocker = parseBlocker(row.blocker);
  return {
    id: str(row.id, "id"),
    title: str(row.title, "title"),
    projectId: row.project_id === null ? null : str(row.project_id, "project_id"),
    status,
    priority,
    lastTouched: iso(row.last_touched, "last_touched"),
    ...(typeof row.session_label === "string"
      ? { sessionLabel: row.session_label }
      : {}),
    ...(context ? { context } : {}),
    ...(blocker ? { blocker } : {}),
    createdAt: iso(row.created_at, "created_at"),
    updatedAt: iso(row.updated_at, "updated_at"),
  };
}

export function rowToProject(row: Row): Project {
  return {
    id: str(row.id, "id"),
    name: str(row.name, "name"),
    remote: row.remote === null ? null : str(row.remote, "remote"),
    statusNote: str(row.status_note, "status_note"),
    lastTouched: iso(row.last_touched, "last_touched"),
    ...(row.dormant === true ? { dormant: true } : {}),
    createdAt: iso(row.created_at, "created_at"),
    updatedAt: iso(row.updated_at, "updated_at"),
  };
}

export function rowToWin(row: Row): Win {
  return {
    id: str(row.id, "id"),
    projectId: str(row.project_id, "project_id"),
    line: str(row.line, "line"),
    at: iso(row.at, "at"),
  };
}
