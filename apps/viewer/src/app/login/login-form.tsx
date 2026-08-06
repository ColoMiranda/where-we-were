"use client";

import { useActionState } from "react";
import { login } from "./actions";

export function LoginForm() {
  const [state, action, pending] = useActionState(login, undefined);

  return (
    <form action={action} className="w-full max-w-sm">
      <label htmlFor="email" className="t-label block">
        Email
      </label>
      <div className="mt-3 flex h-14 items-center border transition-colors duration-150 focus-within:border-(--accent)">
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="h-full min-w-0 flex-1 bg-transparent px-5 text-[14px] text-foreground outline-none placeholder:text-muted-ink focus-visible:outline-none"
        />
      </div>

      <label htmlFor="password" className="t-label mt-8 block">
        Password
      </label>
      <div className="mt-3 flex h-14 items-center border transition-colors duration-150 focus-within:border-(--accent)">
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="h-full min-w-0 flex-1 bg-transparent px-5 text-[14px] text-foreground outline-none placeholder:text-muted-ink focus-visible:outline-none"
        />
      </div>

      {state?.error ? (
        <p role="alert" className="t-data mt-4 text-foreground">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="t-label mt-8 h-14 w-full border hover:bg-foreground hover:text-background disabled:opacity-50"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
