/**
 * Normalize a git remote URL so git@ and https:// clones of the same repo
 * collapse to one identity: strip protocol, auth, `.git` suffix, trailing
 * slashes; lowercase. `git@github.com:a/b.git` and `https://github.com/a/b`
 * both become `github.com/a/b`.
 */
export function normalizeRemote(url: string): string {
  let s = url.trim();
  const scp = s.match(/^[\w.-]+@([\w.-]+):(.+?)(\.git)?\/?$/);
  if (scp) return `${scp[1]}/${scp[2]}`.toLowerCase();
  s = s.replace(/^\w+:\/\//, "").replace(/^[^@/]+@/, "");
  s = s.replace(/\/+$/, "").replace(/\.git$/, "");
  return s.toLowerCase();
}

/** Lowercase-kebab slug, safe for URL segments and CSS view-transition names. */
export function slugify(name: string): string {
  const s = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return s || "project";
}
