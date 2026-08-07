"use client";

import { useEffect, useRef, useState } from "react";

type Segment = { text: string; className?: string };

/**
 * Block type-on for terminal text: the full text renders on the server
 * and stays in the accessibility tree throughout (an sr-only copy), so
 * screen readers never wait. A zero-height ghost reserves the block's
 * width; height grows with the typed content so the box never sits as
 * reserved empty space mid-animation. Styled runs survive typing via
 * segments. Arms only after hydration and below the fold (the SampleIn
 * convention), rests as a block caret, then prints at terminal pace
 * (~8.4s per block) when first scrolled into view — one-shot. No JS,
 * reduced motion, or already on screen at load all mean the finished
 * print, no animation.
 */
export function TypeOn({
  segments,
  className = "",
}: {
  segments: Segment[];
  className?: string;
}) {
  const total = segments.reduce((n, s) => n + s.text.length, 0);
  const ref = useRef<HTMLSpanElement | null>(null);
  const [shown, setShown] = useState(total);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (el.getBoundingClientRect().top < window.innerHeight) return;
    if (total === 0) return;
    queueMicrotask(() => setShown(0));
    let timer = 0;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        const step = 16;
        const chunk = Math.max(1, Math.ceil(total / (8400 / step)));
        let i = 0;
        timer = window.setInterval(() => {
          i += chunk;
          setShown(Math.min(i, total));
          if (i >= total) window.clearInterval(timer);
        }, step);
      },
      { threshold: 0.2 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      window.clearInterval(timer);
    };
  }, [total]);

  const done = shown >= total;
  const takes: number[] = [];
  let used = 0;
  for (const s of segments) {
    takes.push(Math.max(0, Math.min(s.text.length, shown - used)));
    used += s.text.length;
  }

  return (
    <span ref={ref} className={`relative block ${className}`.trim()}>
      <span aria-hidden className="block h-0 overflow-hidden">
        {segments.map((s, k) => (
          <span key={k} className={s.className}>
            {s.text}
          </span>
        ))}
      </span>
      <span className="sr-only">{segments.map((s) => s.text).join("")}</span>
      <span aria-hidden>
        {segments.map((s, k) =>
          takes[k] > 0 ? (
            <span key={k} className={s.className}>
              {s.text.slice(0, takes[k])}
            </span>
          ) : null,
        )}
        {!done && (
          <span className="inline-block h-[0.85em] w-[0.45em] translate-y-[0.05em] bg-foreground" />
        )}
      </span>
    </span>
  );
}
