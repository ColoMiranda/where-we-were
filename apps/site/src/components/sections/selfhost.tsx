import { REPO_URL } from "@/lib/constants";

/**
 * Section 8 — self-host. The hero's secondary CTA ("self-host in 10
 * minutes") anchors here. Terminal snippet is sourced verbatim from
 * README.md's real setup steps (clone, install, the ~/.config/www/.env
 * connection string, the bin symlink) — no invented commands.
 */
export function SelfHost() {
  return (
    <section id="self-host" className="space-y-8 border-t rule-faint py-14">
      <h2 className="t-title">self-host in 10 minutes</h2>

      <p className="t-prose">
        node 23.6+, pnpm, your own free-tier{" "}
        <a
          href="https://supabase.com"
          className="underline underline-offset-2 hover:no-underline"
        >
          supabase
        </a>{" "}
        project, and vercel if you want it on the internet.
      </p>

      <pre className="overflow-x-auto border rule-faint p-5">
        <code>{`$ git clone ${REPO_URL}.git
$ cd where-we-were && pnpm install

# ~/.config/www/.env
WWW_DATABASE_URL="postgresql://postgres.<ref>:<password>@<region>.pooler.supabase.com:6543/postgres?uselibpqcompat=true&sslmode=require"

$ ln -s "$PWD/packages/cli/src/bin.ts" ~/.local/bin/www
$ www init "project name"`}</code>
      </pre>

      <p className="t-prose">
        single user, email and password, RLS-locked to your account — there&rsquo;s no
        multi-tenant anything to trust, because there&rsquo;s no one else&rsquo;s data on
        the other end. your residue never leaves infrastructure you control.
      </p>

      <div className="flex flex-wrap items-center gap-3">
        <a
          href={`${REPO_URL}#setup`}
          className="inline-block border px-3.5 py-2.5 t-label hover:bg-foreground hover:text-background"
        >
          read the full setup on GitHub
        </a>
        <span className="t-label">MIT licensed</span>
      </div>
    </section>
  );
}
