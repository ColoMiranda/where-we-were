import { PixelMap } from "@/components/pixel-map";
import { SampleIn } from "@/components/sample-in";
import { TypeOn } from "@/components/type-on";

/**
 * Three pieces, one postgres — brief §5.4. CLI / viewer / hook+skill, one
 * line each, tightened from README's "Three pieces" list. Each piece wears
 * a PixelMap signature seeded from its label — idle life plus a hover scan
 * — and the three rows sample in on first view. Below them, a plausible CLI
 * transcript covering www add / save / done — flag shapes modeled on the
 * README loop and the brief's copy-as-prompt example. The transcript types
 * itself on first view.
 */
const TRANSCRIPT: { text: string; className?: string }[] = [
  { text: "$ ", className: "text-muted-ink" },
  { text: 'www add "dark mode toggle for the viewer"' },
  { text: "\n" },
  { text: "  → logged to idea bag", className: "text-muted-ink" },
  { text: "\n\n" },
  { text: "$ ", className: "text-muted-ink" },
  { text: "www save fix-webhook-retry-backoff \\" },
  { text: "\n" },
  { text: "    " },
  { text: '--next-step "cap constant is in retry.ts:42, untouched" \\' },
  { text: "\n" },
  { text: "    " },
  { text: '--decision "flattened backoff at cap, not exponential past it"' },
  { text: "\n" },
  {
    text: "  → parked. 1 thing left, 1 decision logged.",
    className: "text-muted-ink",
  },
  { text: "\n\n" },
  { text: "$ ", className: "text-muted-ink" },
  {
    text: 'www done fix-webhook-retry-backoff --win "webhook retries respect the 5min cap"',
  },
  { text: "\n" },
  { text: "  → moved to wins feed", className: "text-muted-ink" },
];
export function Pieces() {
  return (
    <section className="border-t rule-faint py-14">
      <h2 className="t-title mb-8">three pieces, one postgres.</h2>

      <SampleIn as="div">
        <div className="rule-faint border-b py-6 first:pt-0 sig-hover">
          <h3 className="t-headline mb-2 flex items-center gap-3">
            <PixelMap
              id="www — the cli"
              cols={16}
              rows={4}
              cell={5}
              className="text-muted-ink"
            />
            www — the cli
          </h3>
          <p className="t-prose">
            <code>init</code>, <code>add</code>, <code>save</code>,{" "}
            <code>list</code>, <code>done</code>. writes go straight to
            postgres and fail loud — a stale save never clobbers a fresher
            one.
          </p>
        </div>
        <div className="rule-faint border-b py-6 sig-hover">
          <h3 className="t-headline mb-2 flex items-center gap-3">
            <PixelMap
              id="the viewer"
              cols={16}
              rows={4}
              cell={5}
              className="text-muted-ink"
            />
            the viewer
          </h3>
          <p className="t-prose">
            a board of your projects: living status notes, an idea bag, and
            a strip of blockers you answer from your phone.
          </p>
        </div>
        <div className="py-6 pb-0 sig-hover">
          <h3 className="t-headline mb-2 flex items-center gap-3">
            <PixelMap
              id="the hook + skill"
              cols={16}
              rows={4}
              cell={5}
              className="text-muted-ink"
            />
            the hook + skill
          </h3>
          <p className="t-prose">
            a Claude Code Stop hook nudges the agent to park what&rsquo;s
            real before the session ends; an Agent Skill teaches it the
            whole workflow.
          </p>
        </div>
      </SampleIn>

      <pre className="rule-faint border mt-10 p-5 text-[13px] leading-[1.7] whitespace-pre-wrap [overflow-wrap:anywhere]">
        <TypeOn segments={TRANSCRIPT} />
      </pre>
    </section>
  );
}
