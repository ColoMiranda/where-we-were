import type { CSSProperties } from "react";

/**
 * Brand mark — 5×5 cell field, pitch 16 / cell 12 (identity spec, mark v1).
 * Two columns hold; the third breaks; one cell persists at the baseline.
 * `animate` tells the break once: the field flickers alive cell by cell,
 * snaps whole, the third column drops two cells, and the survivor blinks
 * to assert itself. Motion is only cells switching on/off — the global
 * reduced-motion kill stills it to the finished mark.
 */

type CellRole = "on" | "noise" | "break1" | "break2" | "held";

// Column-major (i = col * 5 + row). Columns 0/2/4 are the mark's strokes;
// columns 1/3 are gutter cells that exist only during the noise phase.
const ROLES: CellRole[] = [
  "on", "on", "on", "on", "on",
  "noise", "noise", "noise", "noise", "noise",
  "on", "on", "on", "on", "on",
  "noise", "noise", "noise", "noise", "noise",
  "on", "on", "break1", "break2", "held",
];

// Deterministic flicker order for the noise phase (ms). Hand-scattered so
// the field reads as data writing, not a sweep.
const BLIP_DELAY = [
  390, 60, 540, 210, 480,
  120, 600, 270, 30, 450,
  180, 510, 0, 330, 570,
  240, 90, 420, 660, 150,
  300, 630, 360, 510, 90,
];

export function BrandMark({
  size = 76,
  animate = false,
  className = "",
}: {
  size?: number;
  animate?: boolean;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 76 76"
      width={size}
      height={size}
      shapeRendering="crispEdges"
      role="img"
      aria-label="where we were"
      className={`wwm ${animate ? "wwm-play" : ""} ${className}`.trim()}
    >
      {ROLES.map((role, i) => (
        <rect
          key={i}
          x={Math.floor(i / 5) * 16}
          y={(i % 5) * 16}
          width={12}
          height={12}
          className={`wwm-${role}`}
          style={{ "--wd": `${BLIP_DELAY[i]}ms` } as CSSProperties}
        />
      ))}
    </svg>
  );
}

/**
 * Small cut — the below-32px geometry (bars 4u, pitch 6u, viewBox 0 0 16 16):
 * gutters close into three bars, the third broken. `animate` draws the bars
 * in left to right, then erodes the third bar's middle — the break at
 * glance size.
 */
export function BrandMarkSmall({
  size = 16,
  animate = false,
  className = "",
}: {
  size?: number;
  animate?: boolean;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 16 16"
      width={size}
      height={size}
      shapeRendering="crispEdges"
      aria-hidden="true"
      className={`wws ${animate ? "wws-play" : ""} ${className}`.trim()}
    >
      <rect className="wws-bar1" x="0" y="0" width="4" height="16" />
      <rect className="wws-bar2" x="6" y="0" width="4" height="16" />
      <rect className="wws-cap" x="12" y="0" width="4" height="6" />
      <rect className="wws-mid" x="12" y="6" width="4" height="7" />
      <rect className="wws-base" x="12" y="13" width="4" height="3" />
    </svg>
  );
}
