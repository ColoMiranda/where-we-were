import type React from "react";

/**
 * The problem — brief §5.3, second in the load choreography so the "why"
 * lands before the loop shows the "how". Sessions end, context dies with them; you
 * re-explain "what's left" every morning; existing tools log what
 * happened or lock memory into one agent. Prose register, capped measure.
 */
export function Problem() {
  return (
    <section className="border-t rule-faint py-14">
      <h2
        className="t-title load-sample mb-6"
        style={{ "--ld": "2100ms" } as React.CSSProperties}
      >
        a session ends, and the context goes with it.
      </h2>
      <div
        className="load-sample space-y-4"
        style={{ "--ld": "2300ms" } as React.CSSProperties}
      >
        <p className="t-prose">
          what you were mid-thought about, the decision you almost made, the
          blocker you meant to flag — none of it survives the gap. the next
          morning you re-explain &ldquo;what&rsquo;s left&rdquo; from
          scratch, to the same agent or a different one.
        </p>
        <p className="t-prose">
          git records what shipped. issue trackers record what&rsquo;s
          assigned. your agent&rsquo;s memory, if it has any, stays locked to
          one tool and one repo. nothing records the thing that happens{" "}
          <em>between</em> sessions.
        </p>
      </div>
    </section>
  );
}
