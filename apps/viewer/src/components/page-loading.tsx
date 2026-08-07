/**
 * Route-level loading skeleton, mirroring the Board's loading state so the
 * stream-in swap only replaces the body. The title renders static (no
 * TypeOn) — the type-on is the page's own resolve-on-arrival moment and
 * must not play twice. Without a title (project pages, name unknown while
 * loading) the slot holds a pulse bar instead.
 */
export function PageLoading({ title }: { title?: string }) {
  return (
    <main className="mx-auto w-full max-w-3xl px-6 pb-32">
      <header className="flex items-center justify-between gap-4 py-10">
        {title ? (
          <h1 className="text-[22px] font-bold tracking-[0.08em]">{title}</h1>
        ) : (
          <div
            aria-hidden
            className="h-[22px] w-44 animate-pulse bg-(--bar-faint)"
          />
        )}
      </header>

      <div aria-busy className="space-y-6">
        <p className="t-label">Sampling field…</p>
        {[0, 1, 2].map((i) => (
          <div key={i} className="rule-faint animate-pulse border-b pb-6 pt-2">
            <div className="h-3 w-1/3 bg-(--bar-faint)" />
            <div className="mt-3 h-3 w-2/3 bg-(--bar-faint)" />
          </div>
        ))}
        <p className="sr-only">Loading</p>
      </div>
    </main>
  );
}
