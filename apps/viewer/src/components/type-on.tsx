"use client";

import { useEffect, useState } from "react";

/**
 * Title type-on: the page's name prints in over ~350ms with a block caret
 * that leaves when the line completes — one-shot, resolve-on-arrival.
 * The full text renders on the server and stays in the
 * accessibility tree throughout (the animation runs in an aria-hidden
 * overlay atop a space-reserving copy), so nothing shifts and screen
 * readers never wait. One-shot; reduced motion holds the final still.
 */
export function TypeOn({
  text,
  className = "",
}: {
  text: string;
  className?: string;
}) {
  const [shown, setShown] = useState(text.length);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const total = text.length;
    if (total === 0) return;
    const step = Math.max(16, Math.min(40, 350 / total));
    let i = 0;
    const timer = window.setInterval(() => {
      i++;
      setShown(i);
      if (i >= total) window.clearInterval(timer);
    }, step);
    return () => window.clearInterval(timer);
  }, [text]);

  const typing = shown < text.length;

  return (
    <span className={`relative ${className}`}>
      <span className="opacity-0">{text}</span>
      <span aria-hidden className="absolute inset-0 whitespace-nowrap">
        {text.slice(0, shown)}
        {typing && (
          <span className="inline-block h-[0.85em] w-[0.45em] translate-y-[0.05em] bg-foreground" />
        )}
      </span>
    </span>
  );
}
