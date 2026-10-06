# where we were

**where were we?** — git records what happened. this records what's left and why it stopped.

A memory and staging ground between you and your coding agents. Ideas land here as one-liners. When a session ends, the agent parks its unfinished work: what's left, decisions already made, the question it couldn't answer without you. When you're ready to pick something up, you copy the task out as a prompt and paste it into whatever you use — Claude Code, Cursor, claude.ai, anything with a text box. No plugin, no lock-in.

```
you:    www add "idea"                            → idea bag
agent:  works; session ends; close job runs       → www save: what's left, decisions, blockers
you:    open the board (phone is fine)            → answer a blocker, adjust nothing else
you:    copy task as prompt → paste into any agent → it re-validates against the repo, continues
agent:  www done <id> --win "one line"            → wins feed
```

Three pieces, one Postgres:

- **`www`**: a CLI agents shell out to and you use from the terminal. Commands: `init`, `add`, `save`, `list`, `prompt`, `done`. `www prompt <task-id>` prints a task as a paste-ready prompt. Writes go straight to Supabase and fail loud; stale writes are rejected by a compare-and-set on `updated_at` so nothing fresh ever gets clobbered.
- **The viewer** — a Next.js board of your projects: living status notes, an idea bag, a "waiting on you" strip of blockers you can answer from your phone (the answer travels with the next copied prompt), and a wins feed. Single user, email + password, RLS-locked.
- **The plugin**: for Claude Code, in [`packages/plugin`](packages/plugin/). It has an [Agent Skill](packages/plugin/skills/www/) that teaches Claude the whole workflow, a `/wrap` command to close a session on purpose, and the www mod (a function-hooks module). In registered repos only, the mod shows the project status and up to 3 open tasks when a session starts, puts the status and open tasks in the agent's system prompt, adds `/idea` and `/todo` (each saves a task with no model turn), and starts a background job at session end that parks real leftover work. Step 4 covers install.

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

Then register a folder — git optional — and add your first idea:

```sh
www init "Project Name"
www add "first idea"
```

`init` writes a tiny `.www` marker (just the project slug) that links the folder to its project; commit it in git repos so fresh clones self-link. Repos also resolve by their git remote, marker or not. `www link <project-id>` attaches an existing project to another folder — and if that folder has a remote the project doesn't know yet, the project adopts it. `www help` has the full flag surface.

### 3. Viewer

```sh
cd apps/viewer
printf 'NEXT_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co\nNEXT_PUBLIC_SUPABASE_ANON_KEY=<publishable-key>\n' > .env.local
pnpm dev
```

Log in with the user you created. To put it on the internet (it's auth-walled and RLS-locked): create a Vercel project with **root directory `apps/viewer`**, add the same two env vars, deploy from the repo root.

### 4. The plugin (Claude Code)

The plugin bundles the `www` skill, the `/wrap` command, and the www mod, a function-hooks module (`packages/plugin/hooks/register.tsx`). It needs the `www` CLI from step 2 on your PATH. From a local clone, run these in Claude Code:

```
/plugin marketplace add <path to the repo>/packages/plugin
/plugin install www@where-we-were
```

The mod acts only in registered repos. It does five things:

- **Start band.** On a fresh `claude` start, a band above the prompt shows the project status note and up to 3 open tasks, blocked first. Press 1 to 3 in the empty prompt box and that task's copy-as-prompt text fills the prompt box. You press Enter. The band closes at your first prompt. If the database is unreachable, the band says so in one line.
- **Agent context.** The system prompt gets the project, its status note, and the open tasks, so the agent knows where things stand from the first turn.
- **`/idea <text>` and `/todo <text>`.** Each saves a task with no model turn (`www add --idea` and `www add`).
- **Save on close.** It fires when an interactive session ends (exit, terminal close, or `/clear`) after file edits (edit tools, or shell commands that write files) or 3 or more prompts you sent, with no park and no `/wrap` after them. A park is a `www save` with `--next-step`, `--status-note` or `--blocker-question`; filing a side task with `www add` is not one. The mod then starts a detached, lean `claude -p` job on Sonnet. Its input is the end of the chat (your prompts and Claude's replies, tool calls left out, about 30,000 characters at most) and the open tasks. Its system prompt is a short role plus the www skill. It loads no settings (so no CLAUDE.md, hooks or plugins), skills or MCP servers. It may run only `www` commands, read-only git, and Read, for at most 6 turns. It judges whether real work is left, and saves it with `--session-label "parked on close"` or saves nothing. A close costs about $0.05 to $0.07 at list prices (measured; on a Claude subscription it comes out of your usage limits). Its JSON output goes to `$TMPDIR/www-close-<session>.json`. A hard kill (`kill -9`, power loss) sends no event, so no job runs then. It is on by default; turn it off with the plugin's "Park on close" setting in `/config`.
- **Parked on close.** The next start band marks tasks the close job saved with "parked on close".

The old `www hook stop` command is gone. If you added its Stop entry to `~/.claude/settings.json`, remove it.

### 5. Teach your agents (Claude Code skill)

[`packages/plugin/skills/www/`](packages/plugin/skills/www/) ships an Agent Skill that teaches Claude the full workflow: check parked work on session start, park blockers instead of guessing, save real residue at session end. The plugin in step 4 already includes it. If you skip the plugin, symlink it in:

```sh
ln -s "$(pwd)/packages/plugin/skills/www" ~/.claude/skills/www
```

A one-line pointer in your global `CLAUDE.md` helps it trigger reliably: "In repos where `www project --check` exits 0, load the `www` skill."

## License

[MIT](LICENSE)
