export type TaskStatus =
  | "idea"
  | "todo"
  | "in-progress"
  | "blocked-needs-decision"
  | "parked-with-context"
  | "done";

export const TASK_STATUSES: readonly TaskStatus[] = [
  "idea",
  "todo",
  "in-progress",
  "blocked-needs-decision",
  "parked-with-context",
  "done",
];

export type Priority = 1 | 2 | 3;

export interface BlockerOption {
  id: string;
  label: string;
  recommended?: boolean;
}

export interface Blocker {
  question: string;
  options: BlockerOption[];
  answer?: BlockerAnswer;
}

/** The human's reply to a blocker: a picked option, free text, or both. */
export interface BlockerAnswer {
  optionId?: string;
  text?: string;
  at: string;
}

export interface TaskContext {
  repo?: string;
  branch?: string;
  files?: string[];
  sha?: string;
  decisions?: string[];
  nextStep?: string;
}

export interface WwwTask {
  id: string;
  /** What's left — one imperative line. */
  title: string;
  /** null = lives in the idea bag. */
  projectId: string | null;
  status: TaskStatus;
  priority: Priority;
  lastTouched: string;
  sessionLabel?: string;
  context?: TaskContext;
  blocker?: Blocker;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  name: string;
  /** Normalized git remote, or null for explicitly registered projects. */
  remote: string | null;
  /** Living status note — 2–3 lines of prose for a cold reader. */
  statusNote: string;
  lastTouched: string;
  dormant?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Win {
  id: string;
  projectId: string;
  line: string;
  at: string;
}
