import type { Project, WwwTask } from "./types";

/**
 * Copy-as-prompt: renders a task as a paste-ready prompt for any agent.
 * Carries the imperative line, context, decisions, next step, and the
 * standing instruction to re-validate against the repo before acting.
 */
export function taskToPrompt(task: WwwTask, project?: Project): string {
  const lines: string[] = [task.title + "."];

  const ctx = task.context;
  if (project || ctx) {
    lines.push("");
    lines.push("Context:");
    if (project) lines.push(`- Project: ${project.name}`);
    if (ctx?.repo) lines.push(`- Repo: ${ctx.repo}`);
    if (ctx?.branch) lines.push(`- Branch: ${ctx.branch}`);
    if (ctx?.sha) lines.push(`- Last known commit: ${ctx.sha}`);
    if (ctx?.files?.length) lines.push(`- Files touched: ${ctx.files.join(", ")}`);
  }

  if (ctx?.decisions?.length) {
    lines.push("");
    lines.push("Decisions already made — do not relitigate:");
    for (const d of ctx.decisions) lines.push(`- ${d}`);
  }

  if (ctx?.nextStep) {
    lines.push("");
    lines.push(`Suggested next step: ${ctx.nextStep}`);
  }

  if (task.blocker?.answer) {
    const { answer, options } = task.blocker;
    const chosen = answer.optionId
      ? options.find((o) => o.id === answer.optionId)?.label
      : undefined;
    const resolution = chosen ?? answer.text ?? "(see task)";
    lines.push("");
    lines.push(`Blocker answered — "${task.blocker.question}": ${resolution}`);
  }

  lines.push("");
  lines.push(
    "Before acting, re-validate this context against the current state of the repo; " +
      "it may be stale. If the commit above is unreachable, say so and work from the branch."
  );

  return lines.join("\n");
}
