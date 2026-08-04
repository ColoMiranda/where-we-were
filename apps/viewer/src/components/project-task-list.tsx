"use client";

import type { Project, WwwTask } from "@/lib/types";
import { CopyPromptButton, statusTag } from "@/components/task-controls";
import { dataTime } from "@/lib/time";

export function ProjectTaskList({
  project,
  tasks,
}: {
  project: Project;
  tasks: WwwTask[];
}) {
  return (
    <ul>
      {tasks.map((task, i) => {
        const awaiting = task.status === "blocked-needs-decision";
        return (
          <li
            key={task.id}
            className="field-sample rule-faint border-b py-6"
            style={{ animationDelay: `${i * 40}ms` }}
          >
            <div className="flex flex-wrap items-start gap-x-4 gap-y-2.5 sm:flex-nowrap">
              <span
                className={`t-data shrink-0 pt-px sm:w-32 ${
                  awaiting
                    ? "bg-accent px-2 font-bold text-accent-ink"
                    : ""
                }`}
              >
                {statusTag[task.status]}
              </span>
              <div className="min-w-0 flex-1 basis-full sm:basis-auto">
                <p className="text-[14px] leading-relaxed">{task.title}</p>
                {awaiting && task.blocker && (
                  <p className="mt-1.5 text-[14px] font-bold leading-snug">
                    {task.blocker.question}
                  </p>
                )}
                {task.context?.nextStep && (
                  <p className="t-data mt-2.5 normal-case">
                    NEXT: {task.context.nextStep}
                  </p>
                )}
                <p className="t-data mt-2.5">
                  {[
                    task.sessionLabel,
                    task.context?.branch && `BRANCH ${task.context.branch}`,
                    task.context?.sha,
                    dataTime(task.lastTouched),
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </div>
              <CopyPromptButton task={task} project={project} />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
