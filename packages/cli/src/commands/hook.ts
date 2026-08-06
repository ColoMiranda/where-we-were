import { execFileSync } from "node:child_process";
import { existsSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { normalizeRemote } from "@www/shared";
import { withDb } from "../db.ts";
import { CliError } from "../errors.ts";

const NUDGE_REASON =
  "Session is ending in a registered where-we-were project. Judge honestly: is there real " +
  "unfinished residue — what's left, decisions made, blockers? If yes, park it with www save " +
  "(or www add for newly discovered work) and refresh the status note with --status-note. " +
  "If nothing real is left, stop normally and do not save junk.";

async function readStdin(): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk as Buffer);
  }
  return Buffer.concat(chunks).toString("utf8");
}

/**
 * "www hook stop" is the Claude Code Stop-hook endpoint: Claude Code pipes
 * hook JSON to stdin and reads our stdout as hook output. Its contract is
 * silence — a broken or misconfigured hook must never block the host
 * session — so every failure path here exits 0 with no output instead of
 * throwing. This deliberately overrides bin.ts's fail-loud top-level
 * CliError handler; nothing in this function may let an error escape.
 */
async function stop(): Promise<void> {
  let raw: string;
  try {
    raw = await readStdin();
  } catch {
    process.exit(0);
  }
  if (!raw.trim()) process.exit(0);

  let payload: unknown;
  try {
    payload = JSON.parse(raw);
  } catch {
    process.exit(0);
  }
  // JSON.parse can legally return null/primitives ("null" is valid JSON) —
  // property access on those would throw and break the silence contract.
  if (payload === null || typeof payload !== "object") process.exit(0);

  const sessionId = (payload as { session_id?: unknown }).session_id;
  const cwd = (payload as { cwd?: unknown }).cwd;
  if (typeof sessionId !== "string" || !sessionId || typeof cwd !== "string" || !cwd) {
    process.exit(0);
  }

  const markerName = `www-nudge-${sessionId.replace(/[^A-Za-z0-9_-]/g, "_")}`;
  const marker = join(tmpdir(), markerName);
  if (existsSync(marker)) process.exit(0);

  // Fast path: no remote, no db round-trip. cwd comes from the hook payload,
  // not process.cwd() — the hook process's own cwd is irrelevant here.
  let remoteUrl: string | null;
  try {
    remoteUrl =
      execFileSync("git", ["config", "--get", "remote.origin.url"], {
        cwd,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "ignore"],
      }).trim() || null;
  } catch {
    remoteUrl = null;
  }
  if (!remoteUrl) process.exit(0);

  try {
    const registered = await withDb(async (db) => {
      const r = await db.query("select 1 from projects where remote = $1", [
        normalizeRemote(remoteUrl),
      ]);
      return (r.rowCount ?? 0) > 0;
    });
    if (!registered) process.exit(0);
  } catch {
    // db unreachable, env missing, anything — silent exit, never block Claude Code.
    process.exit(0);
  }

  try {
    writeFileSync(marker, "");
  } catch {
    // best effort — a failed marker write shouldn't cancel the nudge.
  }

  console.log(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "Stop",
        decision: "block",
        reason: NUDGE_REASON,
      },
    }),
  );
  process.exit(0);
}

export async function hook(argv: string[]): Promise<void> {
  const [sub] = argv;
  if (sub !== "stop") {
    throw new CliError("Usage: www hook stop");
  }
  await stop();
}
