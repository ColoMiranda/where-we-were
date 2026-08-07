import { BrandMarkSmall } from "@/components/brand-mark";
import { GithubMark } from "@/components/github-mark";
import { REPO_URL } from "@/lib/constants";

/**
 * Section 9 — footer. The static lockup (small-cut mark + wordmark) opens
 * it, then the proof line, MIT, GithubMark linking to the repo, and a
 * pointer for Claude Code users to the Agent Skill. Hovering the lockup
 * re-fires the small cut bar by bar. No signup, no waitlist, no
 * hosted-service implication.
 */
export function Footer() {
  return (
    <footer className="mx-auto w-full max-w-3xl space-y-6 border-t rule-faint px-6 py-10">
      <div className="flex items-center gap-2 sig-hover">
        <BrandMarkSmall size={16} />
        <span className="t-label font-bold tracking-[0.22em]">WHERE WE WERE</span>
      </div>

      <p>built with Claude Code. used daily by its author.</p>

      <div className="flex flex-wrap items-center gap-3">
        <a
          href={REPO_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 border px-3.5 py-3 t-label hover:bg-foreground hover:text-background"
        >
          <GithubMark />
          github
        </a>
        <span className="t-label">MIT licensed</span>
      </div>

      <p>
        using claude code? the agent skill at{" "}
        <a
          href={`${REPO_URL}/tree/main/skills/www`}
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 hover:no-underline"
        >
          skills/www
        </a>{" "}
        teaches it the whole workflow.
      </p>
    </footer>
  );
}
