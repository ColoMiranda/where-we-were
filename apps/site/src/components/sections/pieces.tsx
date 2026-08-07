/**
 * Three pieces, one postgres — brief §5.4. CLI / viewer / hook+skill, one
 * line each, tightened from README's "Three pieces" list. Below them, a
 * plausible CLI transcript covering www add / save / done — flag shapes
 * modeled on the README loop and the brief's copy-as-prompt example.
 */
export function Pieces() {
  return (
    <section className="border-t rule-faint py-14">
      <p className="t-label mb-4">the stack</p>
      <h2 className="t-title mb-8">three pieces, one postgres.</h2>

      <div>
        <div className="rule-faint border-b py-6 first:pt-0">
          <p className="t-label mb-2">www — the cli</p>
          <p className="t-prose">
            <code>init</code>, <code>add</code>, <code>save</code>,{" "}
            <code>list</code>, <code>done</code>. writes go straight to
            postgres and fail loud — a stale save never clobbers a fresher
            one.
          </p>
        </div>
        <div className="rule-faint border-b py-6">
          <p className="t-label mb-2">the viewer</p>
          <p className="t-prose">
            a board of your projects: living status notes, an idea bag, and
            a strip of blockers you answer from your phone.
          </p>
        </div>
        <div className="py-6 pb-0">
          <p className="t-label mb-2">the hook + skill</p>
          <p className="t-prose">
            a Claude Code Stop hook nudges the agent to park what&rsquo;s
            real before the session ends; an Agent Skill teaches it the
            whole workflow.
          </p>
        </div>
      </div>

      <pre className="rule-faint border mt-10 overflow-x-auto p-5 text-[13px] leading-[1.7]">
        <code>
          <span className="text-muted-ink">$ </span>www add &quot;dark mode
          toggle for the viewer&quot;{"\n"}
          <span className="text-muted-ink">  → logged to idea bag</span>
          {"\n\n"}
          <span className="text-muted-ink">$ </span>www save
          fix-webhook-retry-backoff \{"\n"}
          {"    "}--next-step &quot;cap constant is in retry.ts:42,
          untouched&quot; \{"\n"}
          {"    "}--decision &quot;flattened backoff at cap, not exponential
          past it&quot;{"\n"}
          <span className="text-muted-ink">
            {"  "}→ parked. 1 thing left, 1 decision logged.
          </span>
          {"\n\n"}
          <span className="text-muted-ink">$ </span>www done
          fix-webhook-retry-backoff --win &quot;webhook retries respect the
          5min cap&quot;{"\n"}
          <span className="text-muted-ink">  → moved to wins feed</span>
        </code>
      </pre>
    </section>
  );
}
