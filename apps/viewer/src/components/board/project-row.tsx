"use client";

import Link from "next/link";
import type { Project, WwwTask, Zoom } from "@/lib/types";
import { PixelMap } from "@/components/field-texture";
import { CopyPromptButton, statusTag } from "@/components/task-controls";
import { dataTime } from "@/lib/time";

interface Props {
  project: Project;
  tasks: WwwTask[];
  zoom: Zoom;
  index: number;
}

/** The cobalt tag — the one hue, worn only by the waiting state. */
function AwaitingTag({ children }: { children: React.ReactNode }) {
  return (
    <span className="t-data bg-accent px-2 py-0.5 font-bold text-accent-ink">
      {children}
    </span>
  );
}

export function ProjectRow({ project, tasks, zoom, index }: Props) {
  const open = tasks.filter((t) => t.status !== "done");
  const blocked = open.filter((t) => t.status === "blocked-needs-decision");
  const hasBlocker = blocked.length > 0;
  const touched = dataTime(project.lastTouched);
  const delay = {
    animationDelay: `${index * 50}ms`,
    viewTransitionName: `project-${project.id}`,
  };

  if (zoom === "map") {
    return (
      <li className="field-sample" style={delay}>
        <Link
          href={`/project/${project.id}`}
          className="sig-hover flex h-full flex-col gap-4 border p-5 hover:bg-foreground hover:text-background"
        >
          <span className="flex items-center justify-between gap-3">
            <PixelMap id={project.id} cols={14} rows={4} cell={4} />
            <span className="t-data">{touched}</span>
          </span>
          <span className="min-w-0 truncate text-[14px] font-bold">
            {project.name}
          </span>
          <span className="t-data flex flex-wrap items-center gap-2">
            {open.length > 0 && (
              <span>{String(open.length).padStart(2, "0")} OPEN</span>
            )}
            {hasBlocker && (
              <AwaitingTag>{blocked.length} AWAITING</AwaitingTag>
            )}
            {project.dormant && <span>DORMANT</span>}
          </span>
        </Link>
      </li>
    );
  }

  const noteFirstSentence = project.statusNote.split(/(?<=\.)\s/)[0];

  return (
    <article
      className="field-sample rule-faint border-b py-8"
      style={delay}
    >
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="sig-hover flex items-center gap-4 text-[16px] font-bold">
          <Link
            href={`/project/${project.id}`}
            aria-label={`${project.name} — project detail`}
            className="shrink-0"
          >
            <PixelMap id={project.id} cols={10} rows={3} cell={4} />
          </Link>
          <Link
            href={`/project/${project.id}`}
            className="hover:bg-foreground hover:text-background"
          >
            {project.name}
          </Link>
        </h3>
        <span className="t-data shrink-0">LAST {touched}</span>
      </div>

      <p
        className={`mt-4 max-w-[62ch] text-[15px] leading-[1.75] ${
          zoom === "overview" ? "line-clamp-2" : ""
        }`}
      >
        {zoom === "focus" ? project.statusNote : noteFirstSentence}
      </p>

      <p className="t-data mt-4 flex flex-wrap items-center gap-2.5">
        {open.length === 0 ? (
          <span>NOTHING OPEN</span>
        ) : (
          <span>{String(open.length).padStart(2, "0")} OPEN</span>
        )}
        {hasBlocker && (
          <AwaitingTag>
            {String(blocked.length).padStart(2, "0")} AWAITING INPUT
          </AwaitingTag>
        )}
      </p>

      {zoom === "focus" && open.length > 0 && (
        <ul className="rule-faint mt-6 space-y-4 border-t pt-6">
          {open.slice(0, 4).map((task) => {
            const awaiting = task.status === "blocked-needs-decision";
            return (
              <li
                key={task.id}
                className="flex flex-wrap items-start gap-x-4 gap-y-2 sm:flex-nowrap"
              >
                <span
                  className={`t-data shrink-0 pt-px sm:w-32 ${
                    awaiting
                      ? "bg-accent px-2 font-bold text-accent-ink"
                      : ""
                  }`}
                >
                  {statusTag[task.status]}
                </span>
                <span className="min-w-0 flex-1 basis-full text-[14px] leading-relaxed line-clamp-2 sm:basis-auto">
                  {task.title}
                </span>
                <CopyPromptButton task={task} project={project} />
              </li>
            );
          })}
        </ul>
      )}

      {zoom === "focus" && (
        <p className="t-data mt-4">
          {[
            tasks.find((t) => t.sessionLabel)?.sessionLabel,
            tasks.find((t) => t.context?.sha)?.context?.sha,
          ]
            .filter(Boolean)
            .join(" · ")}
        </p>
      )}
    </article>
  );
}
