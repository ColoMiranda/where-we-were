"use client";

import { useState } from "react";
import type { Project, WwwTask } from "@/lib/types";

/** Squared expand chevron drawn in the world's own stroke. */
function ExpandMark({ open }: { open: boolean }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 10 6"
      width={10}
      height={6}
      className={`shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
      shapeRendering="crispEdges"
    >
      <path d="M0 0h2v2H0zM2 2h2v2H2zM4 4h2v2H4zM6 2h2v2H6zM8 0h2v2H8z" fill="currentColor" />
    </svg>
  );
}

interface Props {
  blocked: WwwTask[];
  projects: Project[];
}

/**
 * The signal surface. Inverted while decisions wait — and it releases back
 * into the field the moment the last one is answered, because inversion
 * means "waiting on you" and nothing waits anymore. Options unfold in
 * place; renders nothing when nothing was ever waiting.
 */
export function BlockersStrip({ blocked, projects }: Props) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [openId, setOpenId] = useState<string | null>(null);

  if (blocked.length === 0) return null;

  const byId = new Map(projects.map((p) => [p.id, p]));
  const remaining = blocked.filter((t) => !answers[t.id]).length;
  const released = remaining === 0;
  const count = String(remaining).padStart(2, "0");
  const markerColor = released
    ? "var(--accent)"
    : "var(--accent-inverted)";

  return (
    <section
      aria-label={
        released
          ? "All decisions answered"
          : `${remaining} decisions waiting on you`
      }
      className={`transition-colors duration-300 ${
        released
          ? "border bg-background text-foreground"
          : "inverted bg-foreground text-background"
      }`}
    >
      <div
        className={`flex items-center justify-between border-b px-6 py-3.5 ${
          released ? "" : "border-background"
        }`}
      >
        <h2 className="t-label font-bold">
          {released ? "Decisions logged" : "Decisions awaiting input"}
        </h2>
        <span
          className="t-data font-bold"
          style={{ color: markerColor }}
          aria-hidden
        >
          {count}
        </span>
      </div>
      <ul
        className={`divide-y px-6 ${released ? "" : "divide-background"}`}
      >
        {blocked.map((task) => {
          const answered = answers[task.id];
          const open = openId === task.id;
          const project = task.projectId ? byId.get(task.projectId) : undefined;
          return (
            <li key={task.id} className="py-4">
              <button
                type="button"
                aria-expanded={open}
                onClick={() => setOpenId(open ? null : task.id)}
                className="flex w-full items-center gap-3.5 text-left"
              >
                {answered ? (
                  <span
                    aria-hidden
                    className="size-2 shrink-0 border"
                    style={{ borderColor: markerColor }}
                  />
                ) : (
                  <span
                    aria-hidden
                    className="size-2 shrink-0"
                    style={{ backgroundColor: markerColor }}
                  />
                )}
                <span className="min-w-0 flex-1 text-[14px] font-bold leading-snug line-clamp-2">
                  {task.blocker?.question}
                </span>
                {project && (
                  <span className="t-data hidden whitespace-nowrap sm:inline">
                    {project.name}
                  </span>
                )}
                <ExpandMark open={open} />
              </button>

              <div
                inert={!open}
                className={`grid transition-[grid-template-rows] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                  open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                }`}
              >
                <div className="overflow-hidden">
                  {answered ? (
                    <p role="status" className="t-data mt-3 pb-1 pl-7">
                      Logged — travels with the next copied prompt.
                    </p>
                  ) : (
                    <div className="mt-4 flex flex-wrap gap-2.5 pb-2 pl-7">
                      {task.blocker?.options.map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() =>
                            setAnswers((a) => ({ ...a, [task.id]: opt.id }))
                          }
                          className={`t-data border px-4 py-2 text-left ${
                            released
                              ? "hover:bg-foreground hover:text-background"
                              : "border-background hover:bg-background hover:text-foreground"
                          }`}
                        >
                          {opt.label}
                          {opt.recommended && (
                            <span className="font-bold"> · REC</span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
      {released && (
        <p role="status" className="t-data field-sample border-t px-6 py-3">
          Nothing awaits — answers travel with the next copied prompts.
        </p>
      )}
    </section>
  );
}
