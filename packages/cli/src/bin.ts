#!/usr/bin/env node
import { add } from "./commands/add.ts";
import { done } from "./commands/done.ts";
import { hook } from "./commands/hook.ts";
import { init } from "./commands/init.ts";
import { link } from "./commands/link.ts";
import { list } from "./commands/list.ts";
import { project } from "./commands/project.ts";
import { save } from "./commands/save.ts";
import { CliError } from "./errors.ts";

const HELP = `www — the memory and staging ground between you and your agents.

Usage:
  www init <name> [--id <slug>]        register the cwd folder (git optional; writes a .www marker)
  www link <project-id>                attach the cwd folder to an existing project
  www add <title> [-p 1|2|3] [--project <id>] [--idea]
  www save <task-id> [--title] [--status] [--priority] [--next-step] [--decision]*
           [--file]* [--sha] [--branch] [--repo] [--blocker-question]
           [--blocker-option <label[:recommended]>]* [--clear-blocker]
           [--session-label] [--status-note]
  www list [--project <id>] [--status <s>]* [--idea] [--all]
  www done <task-id> [--win "<one line>"]
  www project [--check]                register status of the cwd repo
  www hook stop   Claude Code Stop-hook endpoint (reads hook JSON on stdin)

All commands take --json. Task ids accept a unique prefix (4+ chars).
Config: WWW_DATABASE_URL env var, or ~/.config/www/.env`;

const commands: Record<string, (argv: string[]) => Promise<void>> = {
  init,
  link,
  add,
  save,
  list,
  done,
  project,
  hook,
};

const [, , cmd, ...rest] = process.argv;

if (!cmd || cmd === "help" || cmd === "--help" || cmd === "-h") {
  console.log(HELP);
  process.exit(cmd ? 0 : 1);
}

const run = commands[cmd];
if (!run) {
  console.error(`www: unknown command "${cmd}"\n\n${HELP}`);
  process.exit(1);
}

try {
  await run(rest);
} catch (e) {
  const err = e as CliError;
  console.error(`www: ${err.message}`);
  if (err instanceof CliError && err.payload !== undefined) {
    console.error(
      `\nNothing was written. Intended payload:\n${JSON.stringify(err.payload, null, 2)}`,
    );
  }
  process.exit(1);
}
