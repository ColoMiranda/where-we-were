"use server";

import { revalidatePath } from "next/cache";
import { parseBlocker } from "@www/shared";
import { createClient, requireUser } from "@/lib/supabase/server";

export type CaptureState = { error?: string } | undefined;

export async function captureIdea(
  _prev: CaptureState,
  formData: FormData,
): Promise<CaptureState> {
  await requireUser();

  const title = String(formData.get("title") ?? "").trim();
  if (!title) return { error: "Type something first." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("tasks")
    .insert({ title, project_id: null, status: "idea", priority: 3 });
  if (error) return { error: "Couldn't save — " + error.message };

  revalidatePath("/");
  revalidatePath("/bag");
  return undefined;
}

export type AnswerBlockerState = { error?: string } | undefined;

export async function answerBlocker(
  taskId: string,
  cas: string,
  answer: { optionId: string },
  projectId: string | null,
): Promise<AnswerBlockerState> {
  await requireUser();

  if (typeof taskId !== "string" || !taskId) {
    return { error: "Missing task id." };
  }

  const supabase = await createClient();
  const { data: row, error: fetchError } = await supabase
    .from("tasks")
    .select("blocker")
    .eq("id", taskId)
    .single();
  if (fetchError) {
    return { error: "Couldn't load — " + fetchError.message };
  }

  let blocker;
  try {
    blocker = parseBlocker(row?.blocker);
  } catch {
    return { error: "This task has no blocker to answer." };
  }
  if (!blocker) return { error: "This task has no blocker to answer." };

  if (!blocker.options.some((o) => o.id === answer.optionId)) {
    return { error: "That option no longer exists on this task." };
  }

  const merged = {
    ...blocker,
    answer: { optionId: answer.optionId, at: new Date().toISOString() },
  };

  const { data, error } = await supabase
    .from("tasks")
    .update({ blocker: merged })
    .eq("id", taskId)
    .eq("updated_at", cas)
    .select("id");
  if (error) return { error: "Couldn't save — " + error.message };
  if (!data || data.length === 0) {
    return {
      error:
        "Stale — this task changed since you loaded the page. Refresh and try again.",
    };
  }

  revalidatePath("/");
  if (projectId) revalidatePath("/project/" + projectId);
  return undefined;
}
