import Link from "next/link";
import type { WwwTask } from "@/lib/types";
import { SectionRule } from "@/components/section-rule";
import { dataTime } from "@/lib/time";

export function IdeaBagPeek({ ideas }: { ideas: WwwTask[] }) {
  const recent = [...ideas]
    .sort((a, b) => b.lastTouched.localeCompare(a.lastTouched))
    .slice(0, 3);

  return (
    <section aria-label="Idea bag">
      <SectionRule
        title="Idea bag"
        right={
          <Link
            href="/bag"
            className="t-data font-bold underline underline-offset-4 hover:bg-foreground hover:text-background"
          >
            {ideas.length === 0
              ? "OPEN"
              : `ALL ${String(ideas.length).padStart(2, "0")}`}
          </Link>
        }
      />

      {recent.length === 0 ? (
        <p className="mt-4 max-w-[62ch] text-[14px] leading-relaxed">
          Empty for now. Whatever crosses your mind lands here first — one
          line, no ceremony.
        </p>
      ) : (
        <ul>
          {recent.map((idea) => (
            <li
              key={idea.id}
              className="rule-faint flex items-baseline justify-between gap-4 border-b py-4"
            >
              <span className="min-w-0 flex-1 truncate text-[14px]">
                {idea.title}
              </span>
              <span className="t-data w-9 shrink-0 text-right">
                {dataTime(idea.lastTouched)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
