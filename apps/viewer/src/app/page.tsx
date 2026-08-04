import { Board, type BoardState } from "@/components/board/board";
import { projects, tasks, wins } from "@/lib/seed";

// Dev affordance while data is mocked: ?state=loading|error|empty previews
// the board's material states. Ready is the default.
export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ state?: string }>;
}) {
  const { state } = await searchParams;
  const boardState: BoardState =
    state === "loading" || state === "error" || state === "empty"
      ? state
      : "ready";

  return (
    <Board
      state={boardState}
      projects={boardState === "empty" ? [] : projects}
      tasks={boardState === "empty" ? [] : tasks}
      wins={boardState === "empty" ? [] : wins}
    />
  );
}
