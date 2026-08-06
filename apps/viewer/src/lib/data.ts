import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Project, Win, WwwTask } from "@www/shared";
import { rowToProject, rowToTask, rowToWin } from "@www/shared";
import { createClient } from "@/lib/supabase/server";

/**
 * Session gate for every read. Throws instead of redirecting — the data
 * layer fails loud and lets pages/proxy own navigation (a redirect thrown
 * inside the home page's try/catch would be swallowed into the error
 * board). Proxy handles the login redirect; this catches RLS/proxy
 * regressions so a policy slip never renders data to a sessionless client.
 */
async function authedClient(): Promise<SupabaseClient> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw new Error("Not authenticated");
  return supabase;
}

/**
 * A task plus its updated_at as raw Postgres text — the CAS token for
 * answerBlocker. JS Date is millisecond-precision while timestamptz keeps
 * microseconds, so the token must round-trip as the exact string
 * supabase-js returns, never through `new Date(...)`.
 */
export type TaskRow = WwwTask & { cas: string };

export async function getProjects(): Promise<Project[]> {
  const supabase = await authedClient();
  const { data, error } = await supabase.from("projects").select("*");
  if (error) throw new Error("Failed to load projects: " + error.message);
  return (data ?? []).map(rowToProject);
}

export async function getTasks(): Promise<TaskRow[]> {
  const supabase = await authedClient();
  const { data, error } = await supabase.from("tasks").select("*");
  if (error) throw new Error("Failed to load tasks: " + error.message);
  return (data ?? []).map((row) => ({
    ...rowToTask(row),
    cas: String(row.updated_at),
  }));
}

export async function getWins(): Promise<Win[]> {
  const supabase = await authedClient();
  const { data, error } = await supabase.from("wins").select("*");
  if (error) throw new Error("Failed to load wins: " + error.message);
  return (data ?? []).map(rowToWin);
}
