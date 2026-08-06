---
name: www
description: >-
  Work with www ("where we were") — the CLI that records what's left and why
  work stopped, so the next session picks up cold. Use this skill whenever you
  are in a repo registered with www (www project --check exits 0) and any of
  these happen: a session starts and you want to know what was parked; the user
  says "where were we", "pick up where we left off", or "what's left here"; you
  discover work you're not doing now; you hit a decision only the user can
  make; a session is ending with unfinished work; the Claude Code Stop hook
  nudges you to park residue; or you finish a parked task. Also use it when the
  user asks to add, save, park, list, or complete www tasks directly.
---

# www — where we were

www is the memory between sessions. Git records what happened; www records
**what's left and why it stopped**. Everything you save lands on the user's
board, read cold — often weeks later, by a person or an agent with none of
your context. That cold reader is who you write for.

## Guard: registered repos only

Run `www project --check` first; exit 0 means the cwd repo is registered. In
unregistered repos, don't touch www unless the user asks. All commands accept
`--json` for machine-readable output, and task ids accept any unique prefix
of 4+ characters.

## The five moments

### 1. Session start — pick up the thread

```
www list
```

Shows open tasks for this project (`--all` includes done; `--status <s>`
filters; statuses: `idea`, `todo`, `in-progress`, `blocked-needs-decision`,
`parked-with-context`, `done`).

If you pick up a parked task, **re-validate its context before acting**: the
saved repo/branch/sha describe the moment it was parked, and the repo has
moved since. Check the branch still exists, the sha is an ancestor of current
work, and the listed files still look the way the decisions assume. If reality
drifted, say so and adjust the plan — don't execute a stale next-step blindly.

### 2. Discovered work you're not doing now

```
www add "<one imperative line>" [-p 1|2|3]
```

One line, imperative, self-contained — "Add retry to the sync worker", not
"sync issues". It must make sense with zero surrounding context. Default
priority is fine unless the user signals urgency. `--idea` drops it in the
idea bag (no project) instead.

### 3. A decision only the user can make

Don't guess on big calls. Park the task with the question attached:

```
www save <id> --blocker-question "Postgres or SQLite for the cache?" \
  --blocker-option "postgres:recommended" --blocker-option "sqlite"
```

2–3 options, or none for a free-text question; suffix `:recommended` on at
most one. This sets status to `blocked-needs-decision` automatically. The user
answers from the board; `--clear-blocker` removes a blocker once resolved.

### 4. Session end — park the residue

The Stop hook nudges you in registered repos. Judge honestly: is there real
unfinished residue? **If nothing real is left, stop — don't save junk.** A
board full of noise is worse than an empty one.

If there is residue:

```
www save <id> \
  --next-step "the first concrete action to take on pickup" \
  --decision "a call that was made and why, stated as fact" \
  --status parked-with-context \
  --status-note "2-3 lines of prose: where the project stands, for a cold reader"
```

- `--decision` repeats; each is append-only. Record decisions so the next
  session doesn't re-litigate them.
- `--next-step` is the single most valuable field — the exact first move, not
  a vague direction.
- `--file` (repeats) pins the files that matter. Repo, branch, and sha are
  auto-captured from the cwd whenever any context flag is passed; only
  override them (`--repo`, `--branch`, `--sha`) if the work lives elsewhere.
- `--status-note` updates the **project's** living status note, not the task.
  Refresh it whenever the project's overall state changed.
- New work discovered at the end goes through `www add`, not into the note.

### 5. Finished something

```
www done <id> [--win "one line"]
```

Only add `--win` when it's genuinely significant — a shipped feature, a
resolved hard bug. Routine completions don't need one.

## Writing quality bar

Every string you save is read cold. Concretely:

- **Titles**: one imperative line, no context needed.
- **Decisions**: facts, not narration. "Chose libpq over postgres.js —
  Supabase pooler compatibility", not "we discussed drivers".
- **Next-step**: executable as written. A cold agent should be able to start
  from it without asking anything.
- **Status note**: 2–3 lines of prose answering "where is this project and
  what's the state of play?"

## Config

Connection comes from `WWW_DATABASE_URL` or `~/.config/www/.env`. If a
command fails on connection, report it and move on — never block the user's
actual work on www bookkeeping.
