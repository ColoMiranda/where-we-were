"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { numericMatrix } from "@/lib/signature";

const FRAMES = 6;
const FRAME_MS = 66;
const FLIP_TICK_MS = 1400;
const FLIP_CHANCE = 0.35;
const FLIP_HOLD_MS = 150;

/**
 * The numeric-matrix material: digits scramble and settle left-to-right
 * into the id's true signature — on arrival, on hover/tap replay, and
 * back from idle single-digit flips. Server render and first client
 * render both show the final digits, so hydration never mismatches;
 * reduced motion holds the still.
 */
export function SettlingMatrix({
  id,
  cols = 8,
  rows = 3,
  className = "",
}: {
  id: string;
  cols?: number;
  rows?: number;
  className?: string;
}) {
  const [lines, setLines] = useState(() => numericMatrix(id, cols, rows));
  const settling = useRef(false);
  const settleTimer = useRef(0);
  const flipTimer = useRef(0);

  const settle = useCallback(() => {
    if (settling.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    settling.current = true;
    const final = numericMatrix(id, cols, rows);
    let frame = 0;
    settleTimer.current = window.setInterval(() => {
      frame++;
      if (frame >= FRAMES) {
        setLines(final);
        window.clearInterval(settleTimer.current);
        settling.current = false;
        return;
      }
      const settled = Math.floor((frame / FRAMES) * cols);
      setLines(
        final.map((line) =>
          line
            .split("")
            .map((ch, i) => (i < settled ? ch : Math.random() > 0.5 ? "1" : "0"))
            .join("")
        )
      );
    }, FRAME_MS);
  }, [id, cols, rows]);

  useEffect(() => {
    settle();
    return () => {
      window.clearInterval(settleTimer.current);
      settling.current = false;
    };
  }, [settle]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const tick = window.setInterval(() => {
      if (settling.current || document.hidden || Math.random() > FLIP_CHANCE)
        return;
      const final = numericMatrix(id, cols, rows);
      const row = Math.floor(Math.random() * rows);
      const col = Math.floor(Math.random() * cols);
      setLines(
        final.map((line, i) =>
          i === row
            ? line.slice(0, col) +
              (line[col] === "1" ? "0" : "1") +
              line.slice(col + 1)
            : line
        )
      );
      flipTimer.current = window.setTimeout(() => {
        if (!settling.current) setLines(final);
      }, FLIP_HOLD_MS);
    }, FLIP_TICK_MS);
    return () => {
      window.clearInterval(tick);
      window.clearTimeout(flipTimer.current);
    };
  }, [id, cols, rows]);

  return (
    <div
      aria-hidden
      onClick={settle}
      onPointerEnter={(e) => {
        if (e.pointerType === "mouse") settle();
      }}
      className={`text-[9px] leading-[1.6] tracking-[0.2em] text-(--bar-faint) ${className}`}
    >
      {lines.map((line, i) => (
        <div key={i}>{line}</div>
      ))}
    </div>
  );
}
