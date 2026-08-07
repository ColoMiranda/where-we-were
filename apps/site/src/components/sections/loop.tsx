const LOOP = `you:    www add "idea"                            → idea bag
agent:  works; session ends; hook nudges          → www save: what's left, decisions, blockers
you:    open the board (phone is fine)            → answer a blocker, adjust nothing else
you:    copy task as prompt → paste into any agent → it re-validates against the repo, continues
agent:  www done <id> --win "one line"            → wins feed`;

const GLOSSES = [
  "capture a one-liner, no ceremony",
  "park what's left before context dies",
  "answer a blocker, phone works fine",
  "paste into any agent, nothing installed",
  "log the outcome, one line",
];

/**
 * The loop — the README's five-line ASCII loop, verbatim, as a real
 * terminal-text block (pre, hairline border, horizontal scroll on
 * overflow — never wrapped, so the alignment stays intact). Each line
 * gets a short gloss underneath, in the data register.
 */
export function Loop() {
  return (
    <section className="border-t rule-faint py-14">
      <h2 className="t-title">the loop</h2>

      <pre className="mt-6 overflow-x-auto whitespace-pre border px-5 py-5 text-[12px] leading-[1.8] sm:text-[13px]">
        {LOOP}
      </pre>

      <ol className="mt-6" role="list">
        {GLOSSES.map((gloss, i) => (
          <li
            key={gloss}
            className={`flex items-baseline gap-4 py-3 ${
              i > 0 ? "border-t rule-faint" : ""
            }`}
          >
            <span className="t-data">{String(i + 1).padStart(2, "0")}</span>
            <span className="text-[13px]">{gloss}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
