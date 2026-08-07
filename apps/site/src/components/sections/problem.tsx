/**
 * The problem — brief §5.3. Sessions end, context dies with them; you
 * re-explain "what's left" every morning; existing tools log what
 * happened or lock memory into one agent. Prose register, capped measure.
 */
export function Problem() {
  return (
    <section className="border-t rule-faint py-14">
      <p className="t-label mb-4">the problem</p>
      <h2 className="t-title mb-6">
        a session ends, and the context goes with it.
      </h2>
      <div className="space-y-4">
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
