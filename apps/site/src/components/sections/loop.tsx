import type React from "react";

const STEPS = [
  {
    actor: "you",
    action: 'www add "idea"',
    result: "idea bag",
    gloss: "capture a one-liner, no ceremony",
  },
  {
    actor: "agent",
    action: "works; session ends; hook nudges",
    result: "www save: what's left, decisions, blockers",
    gloss: "park what's left before context dies",
  },
  {
    actor: "you",
    action: "open the board (phone is fine)",
    result: "answer a blocker, adjust nothing else",
    gloss: "answer a blocker, phone works fine",
  },
  {
    actor: "you",
    action: "copy task as prompt → paste into any agent",
    result: "it re-validates against the repo, continues",
    gloss: "paste into any agent, nothing installed",
  },
  {
    actor: "agent",
    action: 'www done <id> --win "one line"',
    result: "wins feed",
    gloss: "log the outcome, one line",
  },
] as const;

/**
 * The loop — the README's five loop lines, content verbatim but reflowed
 * as one step per row (actor, action → result, gloss) inside a single
 * bordered block, so every line wraps within the column instead of
 * forcing horizontal scroll. The section is part of the opening
 * choreography: heading and rows sample in on load-sample delays chained
 * behind the hero's, finishing inside the mark's 8s arc.
 */
export function Loop() {
  return (
    <section className="border-t rule-faint py-14">
      <h2
        className="t-title load-sample"
        style={{ "--ld": "2800ms" } as React.CSSProperties}
      >
        the loop
      </h2>

      <ol className="mt-6 border" role="list">
        {STEPS.map((step, i) => (
          <li
            key={step.gloss}
            className={`load-sample px-5 py-4 ${
              i > 0 ? "border-t rule-faint" : ""
            }`}
            style={{ "--ld": `${3000 + i * 300}ms` } as React.CSSProperties}
          >
            <div className="flex items-baseline gap-4">
              <span className="t-data">{String(i + 1).padStart(2, "0")}</span>
              <span className="t-label">{step.actor}</span>
            </div>
            <p className="mt-1.5 max-w-[68ch] text-[13px] leading-[1.7]">
              {step.action}{" "}
              <span className="text-muted-ink">→ {step.result}</span>
            </p>
            <p className="mt-1 max-w-[68ch] text-[13px] leading-[1.7] text-muted-ink">
              {step.gloss}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}
