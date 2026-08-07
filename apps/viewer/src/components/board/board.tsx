"use client";

import { useSyncExternalStore } from "react";
import { flushSync } from "react-dom";
import type { Project, Win, Zoom } from "@/lib/types";
import type { TaskRow } from "@/lib/data";
import { SectionRule } from "@/components/section-rule";
import { TypeOn } from "@/components/type-on";
import { CaptureBar } from "./capture-bar";
import { BlockersStrip } from "./blockers-strip";
import { ProjectRow } from "./project-row";
import { IdeaBagPeek } from "./idea-bag-peek";
import { WinsTeaser } from "./wins-teaser";

export type BoardState = "ready" | "loading" | "error" | "empty";

interface Props {
  state: BoardState;
  projects: Project[];
  tasks: TaskRow[];
  wins: Win[];
}

const ZOOM_KEY = "www.zoom";

// Zoom persists in localStorage; a module-level emitter keeps the hook in
// sync without setState-in-effect (storage events don't fire in-tab).
const zoomListeners = new Set<() => void>();
function subscribeZoom(cb: () => void) {
  zoomListeners.add(cb);
  return () => {
    zoomListeners.delete(cb);
  };
}
function readZoom(): Zoom {
  const saved = window.localStorage.getItem(ZOOM_KEY);
  return saved === "focus" || saved === "overview" || saved === "map"
    ? saved
    : "overview";
}
function writeZoom(z: Zoom) {
  window.localStorage.setItem(ZOOM_KEY, z);
  zoomListeners.forEach((cb) => cb());
}

const zoomLabels: { value: Zoom; label: string }[] = [
  { value: "focus", label: "FOCUS" },
  { value: "overview", label: "OVERVIEW" },
  { value: "map", label: "MAP" },
];

function ZoomToggle({
  zoom,
  onChange,
}: {
  zoom: Zoom;
  onChange: (z: Zoom) => void;
}) {
  return (
    <div role="group" aria-label="Board zoom level" className="ml-auto flex border">
      {zoomLabels.map(({ value, label }, i) => (
        <button
          key={value}
          type="button"
          aria-pressed={zoom === value}
          onClick={() => onChange(value)}
          className={`t-label px-3 py-2 sm:px-4 ${i > 0 ? "border-l" : ""} ${
            zoom === value
              ? "inverted bg-foreground text-background"
              : "hover:bg-foreground hover:text-background"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function CountRule({ title, count }: { title: string; count?: number }) {
  return (
    <SectionRule
      title={title}
      right={
        count !== undefined ? (
          <span className="t-data" aria-hidden>
            {String(count).padStart(2, "0")}
          </span>
        ) : undefined
      }
    />
  );
}

export function Board({ state, projects, tasks, wins }: Props) {
  const zoom = useSyncExternalStore<Zoom>(
    subscribeZoom,
    readZoom,
    () => "overview"
  );

  function changeZoom(z: Zoom) {
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (!reduce && "startViewTransition" in document) {
      // Morph each project between its row and tile shape; suppress the
      // entrance stagger for the duration so the two motions never stack.
      document.documentElement.classList.add("zooming");
      const vt = document.startViewTransition(() => {
        flushSync(() => writeZoom(z));
      });
      vt.finished.finally(() =>
        document.documentElement.classList.remove("zooming")
      );
    } else {
      writeZoom(z);
    }
  }

  const blocked = tasks.filter((t) => t.status === "blocked-needs-decision");
  const ideas = tasks.filter((t) => t.projectId === null && t.status === "idea");
  const active = projects.filter((p) => !p.dormant);
  const dormant = projects.filter((p) => p.dormant);
  const shown = zoom === "map" ? projects : active;
  const sorted = [...shown].sort((a, b) =>
    b.lastTouched.localeCompare(a.lastTouched)
  );

  const tasksFor = (id: string) =>
    tasks
      .filter((t) => t.projectId === id)
      .sort(
        (a, b) =>
          a.priority - b.priority || b.lastTouched.localeCompare(a.lastTouched)
      );

  return (
    <main className="mx-auto w-full max-w-3xl px-6 pb-32">
        <header className="flex flex-wrap items-center justify-between gap-4 py-10">
          <h1 className="text-[22px] font-bold tracking-[0.08em]">
            <TypeOn text="BOARD" />
          </h1>
          {state === "ready" && (
            <ZoomToggle zoom={zoom} onChange={changeZoom} />
          )}
        </header>

        {state === "loading" && (
          <div aria-busy className="space-y-6">
            <p className="t-label">Sampling field…</p>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="rule-faint animate-pulse border-b pb-6 pt-2"
              >
                <div className="h-3 w-1/3 bg-(--bar-faint)" />
                <div className="mt-3 h-3 w-2/3 bg-(--bar-faint)" />
              </div>
            ))}
            <p className="sr-only">Loading the board</p>
          </div>
        )}

        {state === "error" && (
          <div className="border p-5">
            <h2 className="t-label font-bold">Signal lost</h2>
            <p className="mt-4 max-w-[62ch] text-[14px] leading-relaxed">
              Couldn&apos;t reach the store — you may be offline. Nothing is
              lost; the board picks up exactly where it was once the
              connection returns.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="t-label mt-6 border px-5 py-2.5 hover:bg-foreground hover:text-background"
            >
              Retry
            </button>
          </div>
        )}

        {state === "empty" && (
          <div className="space-y-14">
            <CaptureBar />
            <div>
              <h2 className="text-[15px] font-bold">
                Nothing recorded yet — that&apos;s the point of day one.
              </h2>
              <p className="mt-4 max-w-[62ch] text-[14px] leading-relaxed">
                Drop your first idea above; it lands in the bag. When one of
                them becomes real work, promote it to a project. From then on
                this page is where you catch up: what moved, what&apos;s left,
                and what waits on you.
              </p>
            </div>
          </div>
        )}

        {state === "ready" && (
          <div className="space-y-14">
            <CaptureBar />
            <BlockersStrip blocked={blocked} projects={projects} />

            <section aria-label="Projects">
              <CountRule title="Projects" count={shown.length} />
              {zoom === "map" ? (
                <ul
                  key={zoom}
                  className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3"
                >
                  {sorted.map((project, i) => (
                    <ProjectRow
                      key={project.id}
                      project={project}
                      tasks={tasksFor(project.id)}
                      zoom={zoom}
                      index={i}
                    />
                  ))}
                </ul>
              ) : (
                <div key={zoom}>
                  {sorted.map((project, i) => (
                    <ProjectRow
                      key={project.id}
                      project={project}
                      tasks={tasksFor(project.id)}
                      zoom={zoom}
                      index={i}
                    />
                  ))}
                </div>
              )}

              {zoom !== "map" && dormant.length > 0 && (
                <p className="t-data mt-5">
                  {String(dormant.length).padStart(2, "0")} DORMANT —{" "}
                  <button
                    type="button"
                    onClick={() => changeZoom("map")}
                    className="underline underline-offset-4 hover:bg-foreground hover:text-background"
                  >
                    SEE THE MAP
                  </button>
                </p>
              )}
            </section>

            <IdeaBagPeek ideas={ideas} />
            <WinsTeaser wins={wins} projects={projects} />
          </div>
        )}
      </main>
  );
}
