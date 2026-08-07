import { BrandMark } from "@/components/brand-mark";
import { GithubMark } from "@/components/github-mark";
import { REPO_URL } from "@/lib/constants";

/**
 * Hero — kicker, the confirmed git-line headline, sub-line, a mechanism
 * one-liner (not "works with any agent" boilerplate — the receiving side
 * needs nothing installed, per WEBSITE-BRIEF §10), and the two CTAs. Type
 * carries the whole section; the brand mark now opens the hero and plays
 * its break-once entrance (decision of 2026-08-07, supersedes
 * WEBSITE-BRIEF §10 on this point).
 */
export function Hero() {
  return (
    <section className="pt-20 pb-16 sm:pt-28 sm:pb-20">
      <BrandMark size={112} animate className="mb-10" />

      <p className="t-label">www — where we were</p>

      <h1 className="mt-6 text-[28px] sm:text-[40px] font-bold leading-[1.2]">
        git records what happened. this records what&apos;s left.
      </h1>

      <p className="t-prose mt-6">
        a memory and staging ground between you and your coding agents.
        self-hosted, no lock-in.
      </p>

      <p className="mt-4 text-[13px] text-muted-ink">
        open-source, MIT — nothing to install on the agent&apos;s side
      </p>

      <div className="mt-10 flex flex-wrap gap-4">
        <a
          href={REPO_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 border px-3.5 py-2.5 t-label hover:bg-foreground hover:text-background"
        >
          <GithubMark size={13} />
          view on github
        </a>
        <a
          href="#self-host"
          className="inline-flex items-center border px-3.5 py-2.5 t-label hover:bg-foreground hover:text-background"
        >
          self-host in 10 minutes
        </a>
      </div>
    </section>
  );
}
