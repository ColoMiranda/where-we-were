"use client";

import { useState } from "react";
import type { Project, WwwTask } from "@/lib/types";
import { taskToPrompt } from "@/lib/prompt";

export const statusTag: Record<WwwTask["status"], string> = {
  idea: "IDEA",
  todo: "QUEUED",
  "in-progress": "ACTIVE",
  "blocked-needs-decision": "AWAITING INPUT",
  "parked-with-context": "PARKED",
  done: "CLOSED",
};

export function CopyPromptButton({
  task,
  project,
}: {
  task: WwwTask;
  project: Project;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(taskToPrompt(task, project));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copy the prompt below:", taskToPrompt(task, project));
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={copied ? "Prompt copied" : `Copy "${task.title}" as a prompt`}
      className={`t-data relative shrink-0 overflow-hidden border px-3.5 py-1.5 text-foreground ${
        copied
          ? "border-accent"
          : "hover:bg-foreground hover:text-background"
      }`}
    >
      {/* The taking: cobalt sweeps the control as the line leaves the field. */}
      <span
        aria-hidden
        className={`absolute inset-0 origin-left bg-accent transition-transform ease-[cubic-bezier(0.16,1,0.3,1)] ${
          copied ? "scale-x-100 duration-200" : "scale-x-0 duration-150"
        }`}
      />
      <span
        className={`relative transition-colors duration-150 ${
          copied ? "font-bold text-accent-ink" : ""
        }`}
      >
        {copied ? "Copied" : "Copy prompt"}
      </span>
    </button>
  );
}
