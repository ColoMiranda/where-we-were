import { SampleIn } from "@/components/sample-in";

/**
 * Section 7 — why this and not X. The three pillars from WEBSITE-BRIEF.md
 * §3, one tight sentence each, framed per the sharpening notes: human
 * decision inbox, zero-integration mechanism, whole-life idea bag. No
 * competitor names, no comparison table — the moat states itself.
 */
const pillars = [
  {
    index: "01",
    label: "a decision inbox, not a memory",
    body: "a blocker isn't logged and left — it's a decision you answer, with options and a recommendation, whenever you open the board.",
  },
  {
    index: "02",
    label: "zero-integration, by design",
    body: "picking work back up is copy, paste, done — no plugin, no MCP, nothing for the receiving agent to install.",
  },
  {
    index: "03",
    label: "memory for a whole life",
    body: "the idea bag sits next to project status, so a stray thought and an unfinished task live in the same place, not two different tools.",
  },
] as const;

export function Why() {
  return (
    <SampleIn as="section" className="space-y-8 border-t rule-faint py-14">
      <h2 className="t-title">why this, not that</h2>
      <div>
        {pillars.map((pillar, i) => (
          <div
            key={pillar.index}
            className={`space-y-2 py-6 first:pt-0 last:pb-0 ${
              i > 0 ? "border-t rule-faint" : ""
            }`}
          >
            <div className="flex items-baseline gap-3">
              <span className="t-data">{pillar.index}</span>
              <h3 className="t-headline">{pillar.label}</h3>
            </div>
            <p className="t-prose">{pillar.body}</p>
          </div>
        ))}
      </div>
    </SampleIn>
  );
}
