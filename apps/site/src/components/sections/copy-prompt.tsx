/**
 * "Copy as prompt" — the pickup mechanism, and the zero-integration proof
 * (brief pillar 2, §5 item 5). The mechanism is the claim: copy a parked
 * task, paste it anywhere, nothing to install on the receiving side. The
 * worked example is the brief's §6 block, verbatim, as real terminal text.
 */
export function CopyPrompt() {
  return (
    <section
      aria-labelledby="copy-prompt-heading"
      className="border-t rule-faint py-14"
    >
      <p className="t-label mb-4">copy as prompt</p>
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
        {`Task: fix-webhook-retry-backoff (parked 2h ago)
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
have moved since this was parked.`}
      </pre>
    </section>
  );
}
