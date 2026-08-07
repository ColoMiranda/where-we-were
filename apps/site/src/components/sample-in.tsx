"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Plays the field-sample entrance once, the first time the group scrolls
 * into view: direct children stagger in on the field-sample keyframes.
 * Children stay visible by default: no JS, reduced motion, or a group
 * already on screen at load all mean no animation at all. Arming (hiding
 * children) happens only after hydration, and only below the fold.
 */
export function SampleIn({
  as: Tag = "div",
  className = "",
  role,
  id,
  ariaLabelledby,
  children,
}: {
  as?: "div" | "pre" | "ol" | "section";
  className?: string;
  role?: string;
  id?: string;
  ariaLabelledby?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [phase, setPhase] = useState<"idle" | "armed" | "play">("idle");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (el.getBoundingClientRect().top < window.innerHeight) return;
    queueMicrotask(() => setPhase("armed"));
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setPhase("play");
          io.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag
      ref={(node: HTMLElement | null) => {
        ref.current = node;
      }}
      className={`sample-set ${className}`.trim()}
      role={role}
      id={id}
      aria-labelledby={ariaLabelledby}
      data-armed={phase === "idle" ? undefined : ""}
      data-play={phase === "play" ? "" : undefined}
    >
      {children}
    </Tag>
  );
}
