"use client";

import { useEffect, useState } from "react";
import { numericMatrix } from "@/lib/signature";

const FRAMES = 6;
const FRAME_MS = 66;

/**
 * The numeric-matrix material, resolving on arrival: digits scramble and
 * settle left-to-right into the id's true signature over ~400ms. One-shot,
 * never loops; holds the final still under reduced motion. Server render
 * and first client render both show the final digits, so hydration never
 * mismatches — the scramble starts strictly after mount.
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

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const final = numericMatrix(id, cols, rows);
    let frame = 0;
    const timer = window.setInterval(() => {
      frame++;
      if (frame >= FRAMES) {
        setLines(final);
        window.clearInterval(timer);
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
    return () => window.clearInterval(timer);
  }, [id, cols, rows]);

  return (
    <div
      aria-hidden
      className={`text-[9px] leading-[1.6] tracking-[0.2em] text-(--bar-faint) ${className}`}
    >
      {lines.map((line, i) => (
        <div key={i}>{line}</div>
      ))}
    </div>
  );
}
