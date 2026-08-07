import { TypeOn } from "@/components/type-on";
import { SampleIn } from "@/components/sample-in";

const PROMPT_EXAMPLE = `Task: fix-webhook-retry-backoff (parked 2h ago)
Repo: acme/billing-service @ a91f3c2

What's left:
- retry logic doubles backoff correctly, but caps at 30s
  instead of the 5min spec — cap constant is in
  retry.ts:42, untouched
- no test yet for the cap-hit case

Decision needed: keep exponential after cap or flatten?
  Recommendation: flatten at cap (simpler, matches Stripe's
  webhook docs)

Re-validate against the repo before continuing — files may
have moved since this was parked.`;

/**
 * "Copy as prompt" — the pickup mechanism, and the zero-integration proof
 * (brief pillar 2, §5 item 5). The mechanism is the claim: copy a parked
 * task, paste it anywhere, nothing to install on the receiving side. The
 * worked example is the brief's §6 block, verbatim; it types itself on
 * first view.
 */
export function CopyPrompt() {
  return (
    <SampleIn
      as="section"
      ariaLabelledby="copy-prompt-heading"
      className="border-t rule-faint py-14"
    >
      <h2 id="copy-prompt-heading" className="t-title mb-6">
        paste it into whatever you&apos;re using today
      </h2>

      <p className="t-prose">
        picking a parked task back up is one copy and one paste. no
        plugin, no MCP, no protocol to speak first — nothing to install
        on the receiving side. it works in a bare claude.ai text box
        just as well as claude code or cursor.
      </p>
      <p className="t-prose mt-4">
        the prompt carries what&apos;s left, the decisions already made,
        and the blocker&apos;s answer if one was waiting on you. paste
        it in and the agent re-validates against the repo before it
        keeps going.
      </p>

      <p className="t-label mt-10 mb-3">example — what gets copied</p>
      <pre className="overflow-x-auto border p-6 text-[13px] leading-[1.7] whitespace-pre">
        <TypeOn segments={[{ text: PROMPT_EXAMPLE }]} />
      </pre>
    </SampleIn>
  );
}
