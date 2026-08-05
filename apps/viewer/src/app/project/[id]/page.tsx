import { notFound } from "next/navigation";
import { projects, tasks } from "@/lib/seed";
import { PixelMap } from "@/components/field-texture";
import { SettlingMatrix } from "@/components/settling-matrix";
import { SectionRule } from "@/components/section-rule";
import { TypeOn } from "@/components/type-on";
import { ProjectTaskList } from "@/components/project-task-list";
import { dataTime } from "@/lib/time";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = projects.find((p) => p.id === id);
  if (!project) notFound();

  const projectTasks = tasks
    .filter((t) => t.projectId === project.id)
    .sort(
      (a, b) =>
        a.priority - b.priority || b.lastTouched.localeCompare(a.lastTouched)
    );

  return (
    <main className="mx-auto w-full max-w-3xl px-6 pb-32">
      <header className="py-10">
        <div className="flex items-center justify-between gap-4">
          <div className="sig-hover flex items-center gap-4">
            <PixelMap id={project.id} cols={10} rows={3} cell={4} />
            <h1 className="text-[22px] font-bold tracking-[0.08em] uppercase">
              <TypeOn text={project.name} />
            </h1>
          </div>
          <div className="flex shrink-0 items-center gap-4">
            <SettlingMatrix
              id={project.id}
              cols={8}
              rows={3}
              className="hidden sm:block"
            />
            <span className="t-data">
              LAST {dataTime(project.lastTouched)}
              {project.dormant ? " · DORMANT" : ""}
            </span>
          </div>
        </div>
        {project.remote && <p className="t-data mt-3">{project.remote}</p>}
      </header>

      <section aria-label="Status note" className="border p-7">
        <h2 className="t-label font-bold">Where we were</h2>
        <p className="mt-4 max-w-[62ch] text-[15px] leading-[1.75]">
          {project.statusNote}
        </p>
      </section>

      <section aria-label="Tasks" className="mt-14">
        <SectionRule
          title="Tasks"
          right={
            <span className="t-data" aria-hidden>
              {String(projectTasks.length).padStart(2, "0")}
            </span>
          }
        />
        {projectTasks.length === 0 ? (
          <p className="mt-5 max-w-[62ch] text-[14px] leading-relaxed">
            Nothing recorded against this project yet. Copy work in from the
            bag, or let the next session distill into it.
          </p>
        ) : (
          <ProjectTaskList project={project} tasks={projectTasks} />
        )}
      </section>
    </main>
  );
}
