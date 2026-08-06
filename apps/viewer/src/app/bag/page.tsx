import { getTasks } from "@/lib/data";
import { dataTime } from "@/lib/time";
import { CaptureBar } from "@/components/board/capture-bar";
import { TypeOn } from "@/components/type-on";

export default async function BagPage() {
  const tasks = await getTasks();
  const ideas = tasks
    .filter((t) => t.projectId === null && t.status === "idea")
    .sort((a, b) => b.lastTouched.localeCompare(a.lastTouched));

  return (
    <main className="mx-auto w-full max-w-3xl px-6 pb-32">
      <header className="flex items-baseline justify-between py-10">
        <h1 className="text-[22px] font-bold tracking-[0.08em]">
          <TypeOn text="IDEA BAG" />
        </h1>
        <span className="t-data" aria-hidden>
          {String(ideas.length).padStart(2, "0")}
        </span>
      </header>

      <CaptureBar />

      {ideas.length === 0 ? (
        <p className="mt-12 max-w-[62ch] text-[14px] leading-relaxed">
          Empty for now. Whatever crosses your mind lands here first — one
          line, no ceremony. Promoting an idea to a project is a deliberate
          act, made when you decide to start.
        </p>
      ) : (
        <ul className="mt-12 border-t">
          {ideas.map((idea, i) => (
            <li
              key={idea.id}
              className="field-sample rule-faint flex items-baseline gap-4 border-b py-5"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <span className="min-w-0 flex-1 text-[14px]">{idea.title}</span>
              <span className="t-data w-9 shrink-0 text-right">
                {dataTime(idea.lastTouched)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
