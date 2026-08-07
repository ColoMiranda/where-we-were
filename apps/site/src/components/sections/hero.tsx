import type React from "react";

import { BrandMark } from "@/components/brand-mark";
import { GithubMark } from "@/components/github-mark";
import { REPO_URL } from "@/lib/constants";

/**
 * Hero — stacked lockup (mark + wordmark line), the confirmed git-line
 * headline, sub-line, a mechanism one-liner (not "works with any agent"
 * boilerplate — the receiving side needs nothing installed, per
 * WEBSITE-BRIEF §10), and the two CTAs. Type
 * carries the whole section; the brand mark opens the hero with its
 * break-once entrance, and the rows below it sample into place behind
 * the break.
 */
export function Hero() {
  return (
    <section className="pt-20 pb-16 sm:pt-28 sm:pb-20">
      <BrandMark size={112} animate className="mb-5" />

      <p
        className="t-label load-sample font-bold tracking-[0.22em]"
        style={{ "--ld": "600ms" } as React.CSSProperties}
      >
        www — where we were
      </p>

      <h1
        className="load-sample mt-6 text-[30px] font-bold leading-[1.2] sm:text-[40px]"
        style={{ "--ld": "900ms" } as React.CSSProperties}
      >
        git records what happened. this records what&apos;s left.
      </h1>

      <p className="t-prose load-sample mt-6" style={{ "--ld": "1200ms" } as React.CSSProperties}>
        a memory and staging ground between you and your coding agents.
        self-hosted, no lock-in.
      </p>

      <p
        className="load-sample mt-4 text-[13px] text-muted-ink"
        style={{ "--ld": "1500ms" } as React.CSSProperties}
      >
        open-source, MIT — nothing to install on the agent&apos;s side
      </p>

      <div
        className="load-sample mt-10 flex flex-wrap gap-4"
        style={{ "--ld": "1800ms" } as React.CSSProperties}
      >
        <a
          href={REPO_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 border px-3.5 py-3 t-label hover:bg-foreground hover:text-background"
        >
          <GithubMark size={13} />
          view on github
        </a>
        <a
          href="#self-host"
          className="inline-flex items-center border px-3.5 py-3 t-label hover:bg-foreground hover:text-background"
        >
          self-host in 10 minutes
        </a>
      </div>
    </section>
  );
}
