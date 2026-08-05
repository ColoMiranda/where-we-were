import { execFileSync } from "node:child_process";

function git(...args: string[]): string | null {
  try {
    const out = execFileSync("git", args, {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
    return out || null;
  } catch {
    return null;
  }
}

/** Raw origin remote URL of the cwd repo, or null. */
export function getRemoteUrl(): string | null {
  return git("config", "--get", "remote.origin.url");
}

export function getBranch(): string | null {
  return git("rev-parse", "--abbrev-ref", "HEAD");
}

export function getSha(): string | null {
  return git("rev-parse", "HEAD");
}
