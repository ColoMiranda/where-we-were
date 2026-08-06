"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { captureIdea } from "@/lib/actions";

export function CaptureBar() {
  const [value, setValue] = useState("");
  const [justAdded, setJustAdded] = useState(false);
  const [state, formAction, pending] = useActionState(captureIdea, undefined);
  const wasPending = useRef(false);

  // Fires the confirmation once the action settles without an error;
  // an error is surfaced inline instead, below the field.
  useEffect(() => {
    const settled = wasPending.current && !pending;
    wasPending.current = pending;
    if (!settled || state?.error) return;
    setJustAdded(true);
    const t = window.setTimeout(() => setJustAdded(false), 2200);
    return () => window.clearTimeout(t);
  }, [pending, state]);

  function submit(e: React.FormEvent<HTMLFormElement>) {
    if (!value.trim()) {
      e.preventDefault();
      return;
    }
    setValue("");
  }

  return (
    <form action={formAction} onSubmit={submit}>
      <label htmlFor="capture" className="t-label block">
        Capture
      </label>
      <div className="mt-3 flex h-14 items-center border transition-colors duration-150 focus-within:border-(--accent)">
        <input
          id="capture"
          name="title"
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
              disabled={pending}
              className="t-label h-full border-l px-6 hover:bg-foreground hover:text-background disabled:opacity-50"
            >
              Log
            </button>
          )
        )}
      </div>
      {state?.error && (
        <p role="alert" className="t-data mt-2 text-(--accent)">
          {state.error}
        </p>
      )}
    </form>
  );
}
