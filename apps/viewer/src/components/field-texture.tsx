import { pixelGrid } from "@/lib/signature";

/** A project's identity glyph: a deterministic on/off pixel grid. */
export function PixelMap({
  id,
  cols = 16,
  rows = 4,
  cell = 4,
  className = "",
}: {
  id: string;
  cols?: number;
  rows?: number;
  cell?: number;
  className?: string;
}) {
  const cells = pixelGrid(id, cols, rows);
  return (
    <svg
      aria-hidden
      viewBox={`0 0 ${cols * cell} ${rows * cell}`}
      width={cols * cell}
      height={rows * cell}
      className={`shrink-0 ${className}`}
      shapeRendering="crispEdges"
    >
      {cells.map(
        (on, i) =>
          on && (
            <rect
              key={i}
              x={(i % cols) * cell}
              y={Math.floor(i / cols) * cell}
              width={cell - 1}
              height={cell - 1}
              fill="currentColor"
            />
          )
      )}
    </svg>
  );
}
