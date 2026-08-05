#!/usr/bin/env node
import { add } from "./commands/add.ts";
import { done } from "./commands/done.ts";
import { init } from "./commands/init.ts";
import { list } from "./commands/list.ts";
import { save } from "./commands/save.ts";
import { CliError } from "./errors.ts";

const HELP = `www — the memory and staging ground between you and your agents.

Usage:
  www init <name> [--id <slug>]        register the cwd repo (or a no-remote project)
  www add <title> [-p 1|2|3] [--project <id>] [--idea]
  www save <task-id> [--title] [--status] [--priority] [--next-step] [--decision]*
           [--file]* [--sha] [--branch] [--repo] [--blocker-question]
           [--blocker-option <label[:recommended]>]* [--clear-blocker]
           [--session-label] [--status-note]
  www list [--project <id>] [--status <s>]* [--idea] [--all]
  www done <task-id> [--win "<one line>"]

All commands take --json. Task ids accept a unique prefix (4+ chars).
Config: WWW_DATABASE_URL env var, or ~/.config/www/.env`;

const commands: Record<string, (argv: string[]) => Promise<void>> = {
  init,
  add,
  save,
  list,
  done,
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
