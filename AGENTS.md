# where we were — agent guide

**www** ("where we were") is the memory and staging ground between a developer and their coding agents: git records what happened, www records what's left and why it stopped. Self-host, single-user: one Supabase Postgres, a CLI, a Next.js board.

## Commands

- **Node 23.6+ required.** The CLI and shared package run raw TypeScript via Node's native type-stripping — there is no build step outside the Next apps.
- `pnpm install` at the repo root (pnpm workspace).
- Viewer (the board): `pnpm --filter viewer dev` / `build` / `lint`. Needs `apps/viewer/.env.local` with `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- Site (public marketing page): `pnpm --filter site dev` / `build` / `lint`. No backend.
- CLI: `node packages/cli/src/bin.ts <cmd>` or the linked `www` bin. Config: `WWW_DATABASE_URL` env var, falling back to `~/.config/www/.env`.
- Typecheck from inside a package: `cd packages/cli && pnpm exec tsc --noEmit`. There is no root-level tsc and no test suite.

## Architecture

Five workspace packages around one Postgres (the user's own Supabase project):

- `packages/cli` — the `www` binary. `src/bin.ts` is a flat command dispatcher; each command is one function in `src/commands/`. Talks **directly to Postgres** with `pg` over the Supabase transaction pooler — the connection string must carry `uselibpqcompat=true&sslmode=require`, because pg v8 treats plain `sslmode=require` as full cert verification, which the pooler fails.
- `apps/viewer` — the board. Next.js App Router: server components fetch through `src/lib/data.ts`, mutations are server actions in `src/lib/actions.ts`, copy-as-prompt is built in `src/lib/prompt.ts`, Supabase clients live in `src/lib/supabase/`. Auth is email + password via supabase-js; RLS policies (migration `0002`) scope every row to the owner's email, so the anon key exposes nothing to anyone else.
- `packages/shared` — `@www/shared`: the domain types, slug/remote normalization, and row→object mapping used by both CLI and viewer. Exports raw `.ts` (`"." → ./src/index.ts`); Node strips types for the CLI, Next transpiles it for the viewer.
- `packages/plugin` — Claude Code plugin bundling the `www` skill (`skills/www/SKILL.md`) and an opt-in (`WWW_STOP_NUDGE=1`), once-per-session Stop hook (`www hook stop`). Requires the `www` bin on PATH.
- `apps/site` — static marketing page. No data dependencies.

Cross-cutting behavior worth knowing before editing:

- **Stale writes are rejected by compare-and-set on `updated_at`.** The CAS token travels as Postgres *text*, never a JS `Date` — timestamptz keeps microseconds, `Date` is millisecond-precision, so round-tripping through `Date` makes every CAS look stale. See `packages/cli/src/store.ts`.
- **Folder→project resolution** is a `.www` marker file (just the project slug, found by walking up directories) or a normalized git-remote match. A malformed marker is treated as absent, never guessed at.
- `supabase/migrations/` is run by hand in the Supabase SQL editor; `0002_policies.sql` requires replacing `OWNER_EMAIL` first.
- Task ids accept any unique prefix of 4+ chars; every CLI command takes `--json`.
- Next is v16 — newer than most training data. `apps/viewer/AGENTS.md` points at the bundled docs in `node_modules/next/dist/docs/`; read them before writing Next-specific code.

## Repo conventions

- Writes fail loud; errors are `CliError` with an optional structured payload for `--json` consumers.
- Product/design working docs (`PRODUCT.md`, `DESIGN.md`, `PROGRESS.md`, `MONETIZATION.md`, …) are gitignored and local-only — don't reference them from committed code or docs.
