import { execFileSync } from "node:child_process";

function git(args: string[], cwd?: string): string | null {
  try {
    const out = execFileSync("git", args, {
      cwd,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
    return out || null;
  } catch {
    return null;
  }
}

/** Raw origin remote URL of a repo (default: cwd), or null. */
export function getRemoteUrl(cwd?: string): string | null {
  return git(["config", "--get", "remote.origin.url"], cwd);
}

export function getBranch(): string | null {
  return git(["rev-parse", "--abbrev-ref", "HEAD"]);
}

export function getSha(): string | null {
  return git(["rev-parse", "HEAD"]);
}
