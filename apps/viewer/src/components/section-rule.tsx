/**
 * Section header: tracked label over a hairline rule, with a short cobalt
 * tick opening the rule — the system's one structural accent.
 */
export function SectionRule({
  title,
  right,
}: {
  title: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="relative flex items-baseline justify-between border-b pb-3">
      <h2 className="t-label font-bold">{title}</h2>
      {right}
      <span
        aria-hidden
        className="absolute -bottom-px left-0 h-px w-6 bg-accent"
      />
    </div>
  );
}
