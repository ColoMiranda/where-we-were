import Link from "next/link";
import type { Project, Win } from "@/lib/types";
import { SectionRule } from "@/components/section-rule";
import { dataTime } from "@/lib/time";

export function WinsTeaser({
  wins,
  projects,
}: {
  wins: Win[];
  projects: Project[];
}) {
  const byId = new Map(projects.map((p) => [p.id, p]));

  return (
    <section aria-label="Closed this week">
      <SectionRule
        title="Closed this week"
        right={
          <Link
            href="/wins"
            className="t-data font-bold underline underline-offset-4 hover:bg-foreground hover:text-background"
          >
            FULL LOG
          </Link>
        }
      />

      {wins.length === 0 ? (
        <p className="mt-4 max-w-[62ch] text-[14px] leading-relaxed">
          A quiet week so far. Wins land here on their own when significant
          work closes.
        </p>
      ) : (
        <ul>
          {wins.map((win) => {
            const project = byId.get(win.projectId);
            return (
              <li
                key={win.id}
                className="rule-faint flex flex-wrap items-baseline gap-x-5 gap-y-1 border-b py-4 sm:flex-nowrap"
              >
                {project && (
                  <span className="t-data shrink-0 sm:w-36 sm:truncate">
                    {project.name}
                  </span>
                )}
                <span className="min-w-0 flex-1 basis-full text-[14px] sm:basis-auto">
                  {win.line}
                </span>
                <span className="t-data ml-auto shrink-0 text-right sm:ml-0 sm:w-9">
                  {dataTime(win.at)}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
