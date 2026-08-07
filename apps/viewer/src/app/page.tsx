import { unstable_rethrow } from "next/navigation";
import { Board } from "@/components/board/board";
import { getProjects, getTasks, getWins } from "@/lib/data";

// Dev affordance while data is mocked: ?state=loading|error|empty previews
// the board's material states. Ready is the default.
export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ state?: string }>;
}) {
  const { state } = await searchParams;
  if (state === "loading" || state === "error" || state === "empty") {
    return <Board state={state} projects={[]} tasks={[]} wins={[]} />;
  }

  const data = await Promise.all([getProjects(), getTasks(), getWins()])
    .then(([projects, tasks, wins]) => ({ projects, tasks, wins }))
    .catch((err) => {
      // Next signals redirects and dynamic-rendering bailouts by throwing;
      // catching those here would bake the error board into a prerender.
      unstable_rethrow(err);
      console.error("Board data failed to load:", err);
      return null;
    });

  if (!data) {
    return <Board state="error" projects={[]} tasks={[]} wins={[]} />;
  }
  return <Board state="ready" {...data} />;
}
