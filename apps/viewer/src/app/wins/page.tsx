import { projects, wins } from "@/lib/seed";
import { dataTime } from "@/lib/time";
import { TypeOn } from "@/components/type-on";

export default function WinsPage() {
  const byId = new Map(projects.map((p) => [p.id, p]));
  const sorted = [...wins].sort((a, b) => b.at.localeCompare(a.at));

  return (
    <main className="mx-auto w-full max-w-3xl px-6 pb-32">
      <header className="flex items-baseline justify-between py-10">
        <h1 className="text-[22px] font-bold tracking-[0.08em]">
          <TypeOn text="CLOSED THIS WEEK" />
        </h1>
        <span className="t-data" aria-hidden>
          {String(sorted.length).padStart(2, "0")}
        </span>
      </header>

      {sorted.length === 0 ? (
        <p className="max-w-[62ch] text-[14px] leading-relaxed">
          A quiet week so far. Wins land here on their own when significant
          work closes.
        </p>
      ) : (
        <ul className="border-t">
          {sorted.map((win, i) => {
            const project = byId.get(win.projectId);
            return (
              <li
                key={win.id}
                className="field-sample rule-faint flex flex-wrap items-baseline gap-x-5 gap-y-1 border-b py-5 sm:flex-nowrap"
                style={{ animationDelay: `${i * 40}ms` }}
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
    </main>
  );
}
