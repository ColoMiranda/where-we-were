import { Board, type BoardState } from "@/components/board/board";
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

  try {
    const [projects, tasks, wins] = await Promise.all([
      getProjects(),
      getTasks(),
      getWins(),
    ]);
    return (
      <Board state="ready" projects={projects} tasks={tasks} wins={wins} />
    );
  } catch {
    return <Board state="error" projects={[]} tasks={[]} wins={[]} />;
  }
}
