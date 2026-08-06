# where we were

**git records what happened. this records what's left and why it stopped.**

A memory and staging ground between you and your coding agents. Capture ideas as they come; when a session ends, the agent parks its unfinished work — what's left, decisions already made, blockers — and when it's time to work again, you copy any task out as a prompt and paste it into whatever agent you use. Claude Code, Cursor, claude.ai — anything with a text box. No plugin, no lock-in.

Three pieces, one Postgres:

- **`www`** — a CLI agents shell out to and you use from the terminal: `init`, `add`, `save`, `list`, `done`. Writes go straight to Supabase and fail loud; stale writes are rejected by a compare-and-set on `updated_at` so nothing fresh ever gets clobbered.
- **The viewer** — a Next.js board of your projects: living status notes, an idea bag, a "waiting on you" strip of blockers you can answer from your phone (the answer travels with the next copied prompt), and a wins feed. Single user, email + password, RLS-locked.
- **The hook** — a Claude Code Stop hook (`www hook stop`) that nudges the agent once per session, only in registered repos: *anything real left? park it — don't save junk.*

This is a personal v1, built with Claude Code and used daily by its author. It's a **self-host** project: you bring your own free-tier Supabase and (optionally) Vercel, and your residue stays yours.

## Setup

You need Node 23.6+ (native TypeScript execution — no build step anywhere), pnpm, and a [Supabase](https://supabase.com) project.

### 1. Database

In the Supabase SQL editor, run in order:

1. `supabase/migrations/0001_init.sql`
2. `supabase/migrations/0002_policies.sql` — **first replace `OWNER_EMAIL` with your email.** Every policy is scoped to it; anyone else gets zero rows.

Then in the dashboard: **Authentication → Providers → Email** — disable "Allow new users to sign up". **Authentication → Users → Add user** — your email + a password, auto-confirm.

### 2. CLI

```sh
pnpm install
```

Put your **transaction pooler** connection string (Settings → Database, port 6543) in `~/.config/www/.env`:

```
WWW_DATABASE_URL="postgresql://postgres.<ref>:<password>@<region>.pooler.supabase.com:6543/postgres?uselibpqcompat=true&sslmode=require"
```

(The `uselibpqcompat` part matters — pg v8 treats plain `sslmode=require` as full cert verification, which the pooler fails.)

Put the bin on your PATH — either `pnpm setup && cd packages/cli && pnpm link --global`, or just symlink it:

```sh
ln -s "$PWD/packages/cli/src/bin.ts" ~/.local/bin/www
```

Then, inside any folder you work in — **git optional**: `www init "Project Name"` — and try `www add "first idea"`.

`init` writes a tiny `.www` marker (just the project slug) that links the folder to its project; commit it in git repos so fresh clones self-link. Repos also resolve by their git remote, marker or not. `www link <project-id>` attaches an existing project to another folder — and if that folder has a remote the project doesn't know yet, the project adopts it.

### 3. Viewer

```sh
cd apps/viewer
printf 'NEXT_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co\nNEXT_PUBLIC_SUPABASE_ANON_KEY=<publishable-key>\n' > .env.local
pnpm dev
```

Log in with the user you created. To put it on the internet (it's auth-walled and RLS-locked): create a Vercel project with **root directory `apps/viewer`**, add the same two env vars, deploy from the repo root.

### 4. The session-end nudge (Claude Code)

Add to `~/.claude/settings.json`:

```json
{
  "hooks": {
    "Stop": [
      { "hooks": [ { "type": "command", "command": "<absolute path to>/www hook stop", "timeout": 15 } ] }
    ]
  }
}
```

It's silent everywhere except registered repos, fires once per session, and never blocks your session on any failure.

### 5. Teach your agents (Claude Code skill)

[`skills/www/`](skills/www/) ships an Agent Skill that teaches Claude the full workflow — check parked work on session start, park blockers instead of guessing, save real residue at session end. Symlink it in:

```sh
ln -s "$(pwd)/skills/www" ~/.claude/skills/www
```

A one-line pointer in your global `CLAUDE.md` helps it trigger reliably: "In repos where `www project --check` exits 0, load the `www` skill."

## The loop

```
you:    www add "idea"                      → idea bag
agent:  works; session ends; hook nudges    → www save: what's left, decisions, blockers
you:    open the board (phone is fine)      → answer a blocker, adjust nothing else
you:    copy task as prompt → paste into any agent → it re-validates against the repo and continues
agent:  www done <id> --win "one line"      → wins feed
```

## License

[MIT](LICENSE)
