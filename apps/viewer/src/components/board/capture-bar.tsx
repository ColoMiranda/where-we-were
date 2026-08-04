"use client";

import { useState } from "react";

export function CaptureBar() {
  const [value, setValue] = useState("");
  const [justAdded, setJustAdded] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const line = value.trim();
    if (!line) return;
    // v1 mock: capture lands locally. Supabase wiring replaces this.
    setValue("");
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 2200);
  }

  return (
    <form onSubmit={submit}>
      <label htmlFor="capture" className="t-label block">
        Capture
      </label>
      <div className="mt-3 flex h-14 items-center border transition-colors duration-150 focus-within:border-(--accent)">
        <input
          id="capture"
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Drop an idea — one line is enough"
          autoComplete="off"
          className="h-full min-w-0 flex-1 bg-transparent px-5 text-[14px] text-foreground outline-none placeholder:text-muted-ink focus-visible:outline-none"
        />
        {justAdded ? (
          <span
            role="status"
            className="t-data field-sample flex h-full items-center border-l px-5 font-bold text-foreground"
          >
            Logged — bag
          </span>
        ) : (
          value.trim() && (
            <button
              type="submit"
              className="t-label h-full border-l px-6 hover:bg-foreground hover:text-background"
            >
              Log
            </button>
          )
        )}
      </div>
    </form>
  );
}
