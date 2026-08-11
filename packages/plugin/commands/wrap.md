---
description: Park unfinished work with www, report uncommitted and unpushed changes, and confirm the session is safe to quit.
disable-model-invocation: true
allowed-tools: Bash, Skill, AskUserQuestion
---

# /wrap — close the session cleanly

The end-of-session flow, run on purpose. The Stop-hook nudge catches what you
forget; this is what you type when you know you're done. Park the residue,
surface the work that would be lost, confirm it's safe to quit.

Work the five steps in order, and never let one failing stop the next — a
partial wrap beats a broken one.

## 1. Guard

```sh
www project --check
```

Exit 0 means the cwd repo is registered with www — do step 2. Any other exit,
`www` missing from PATH, or an unreachable database: skip step 2, say why in one
line, and carry on to step 3. www bookkeeping never blocks the wrap.

## 2. Park the residue

Load the `www:www` skill and run its *session end* moment. Follow its writing bar
as written — everything saved is read cold, often weeks later, by someone with
none of your context.

Its honesty rule holds here too: **if nothing real is left, save nothing.** An
empty board beats a noisy one, and typing `/wrap` is not a reason to invent
residue.

## 3. Survey — read only

Skip this step entirely if the cwd isn't a git repo.

```sh
git status --porcelain
git log --oneline @{u}..HEAD 2>/dev/null
```

`@{u}` fails on a detached HEAD or a branch with no upstream. Treat that as
"nothing to compare against", not as an error worth reporting.

Also note any background shells still running — they die with the session.

## 4. Offer to commit

Only when the tree is dirty or commits are unpushed. On a clean repo, skip it —
don't ask a question with no useful answer.

Use AskUserQuestion with three options: commit and push, commit only, leave it.
The question is the consent gate: make the offer, never act first. If the user
picks a commit, write the message from what actually changed and match the
repo's existing style.

## 5. Verdict

Print the block, dropping any line with nothing to say:

```
PARKED
· a3f2  Fix CAS token round-trip
        next: swap Date for text in store.ts

UNCOMMITTED  3 files
UNPUSHED     2 commits on main
BG JOBS      none

→ safe to quit (Ctrl+D)
```

Then spend the Stop hook's once-per-session nudge, so it doesn't turn around and
ask you to park what you just parked:

```sh
touch "${TMPDIR:-/tmp}/www-nudge-$CLAUDE_CODE_SESSION_ID"
```

## The quit is the user's

Nothing here exits Claude Code — `/exit` belongs to the terminal, not to any
tool. End at "safe to quit" and let the user press Ctrl+D. Never kill the
process to save them the keystroke.
