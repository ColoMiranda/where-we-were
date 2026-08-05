import type { CSSProperties } from "react";
import { pixelGrid, signatureLife } from "@/lib/signature";

/**
 * A project's identity glyph: a deterministic on/off pixel grid. Carries
 * the living-signature idle loop and the hover scan (triggered by the svg
 * itself or a `.sig-hover` ancestor); the grid itself never changes.
 */
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
  const life = signatureLife(id, cells);
  return (
    <svg
      aria-hidden
      viewBox={`0 0 ${cols * cell} ${rows * cell}`}
      width={cols * cell}
      height={rows * cell}
      className={`pm shrink-0 ${className}`}
      shapeRendering="crispEdges"
    >
      {cells.map((on, i) => (
        <rect
          key={i}
          x={(i % cols) * cell}
          y={Math.floor(i / cols) * cell}
          width={cell - 1}
          height={cell - 1}
          fill="currentColor"
          opacity={on ? undefined : 0}
          className={on ? "pm-on pm-dip" : "pm-ghost"}
          style={
            {
              // Column-major scan index: the sweep runs left to right.
              "--i": (i % cols) * rows + Math.floor(i / cols),
              "--sj": `${life[i].scanJitter}ms`,
              "--sd": `${life[i].scanDuration}ms`,
              "--p": `${life[i].period}s`,
              "--d": `${life[i].delay}s`,
            } as CSSProperties
          }
        />
      ))}
    </svg>
  );
}
