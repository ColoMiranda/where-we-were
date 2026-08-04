"use client";

import { useSyncExternalStore } from "react";

type Theme = "dark" | "light" | "auto";

const THEME_KEY = "www.theme";

// localStorage-backed store; a module-level emitter keeps the hook in sync
// (storage events don't fire in-tab). data-theme is always an explicit
// dark/light value — AUTO resolves through matchMedia and tracks OS changes.
const listeners = new Set<() => void>();
const lightQuery = "(prefers-color-scheme: light)";

function systemTheme(): "dark" | "light" {
  return window.matchMedia(lightQuery).matches ? "light" : "dark";
}
function subscribe(cb: () => void) {
  listeners.add(cb);
  const mq = window.matchMedia(lightQuery);
  const onSystemChange = () => {
    if (readTheme() === "auto") {
      document.documentElement.dataset.theme = systemTheme();
      cb();
    }
  };
  mq.addEventListener("change", onSystemChange);
  return () => {
    listeners.delete(cb);
    mq.removeEventListener("change", onSystemChange);
  };
}
function readTheme(): Theme {
  const saved = window.localStorage.getItem(THEME_KEY);
  return saved === "dark" || saved === "light" ? saved : "auto";
}
function writeTheme(t: Theme) {
  const root = document.documentElement;
  // One-beat cross-fade between fields; skipped under reduced motion.
  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    root.classList.add("theme-anim");
    window.setTimeout(() => root.classList.remove("theme-anim"), 300);
  }
  if (t === "auto") {
    window.localStorage.removeItem(THEME_KEY);
    root.dataset.theme = systemTheme();
  } else {
    window.localStorage.setItem(THEME_KEY, t);
    root.dataset.theme = t;
  }
  listeners.forEach((cb) => cb());
}

const options: Theme[] = ["dark", "light", "auto"];

export function ThemeToggle() {
  const theme = useSyncExternalStore<Theme>(subscribe, readTheme, () => "auto");
  const next = options[(options.indexOf(theme) + 1) % options.length];

  return (
    <>
      {/* Compact cycle on phones; full segmented control from sm up. */}
      <button
        type="button"
        onClick={() => writeTheme(next)}
        aria-label={`Theme: ${theme}. Switch to ${next}`}
        className="t-label flex items-center border-l px-3 hover:bg-foreground hover:text-background sm:hidden"
      >
        {theme}
      </button>
      <div
        role="group"
        aria-label="Theme"
        className="hidden items-stretch sm:flex"
      >
        {options.map((t) => (
          <button
            key={t}
            type="button"
            aria-pressed={theme === t}
            onClick={() => writeTheme(t)}
            className={`t-label border-l px-4 ${
              theme === t
                ? "inverted bg-foreground text-background"
                : "hover:bg-foreground hover:text-background"
            }`}
          >
            {t}
          </button>
        ))}
      </div>
    </>
  );
}
