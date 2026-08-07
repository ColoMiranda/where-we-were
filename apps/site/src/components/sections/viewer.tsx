import Image from "next/image";
import { SampleIn } from "@/components/sample-in";

/**
 * "The viewer" (brief §5 item 6): the living status note, the "waiting on
 * you" blocker strip (options + a recommendation, answerable from your
 * phone), and the idea bag sitting next to project status. The real
 * board screenshot lives at public/viewer-board.png.
 */
export function Viewer() {
  return (
    <SampleIn
      as="section"
      ariaLabelledby="viewer-heading"
      className="border-t rule-faint py-14"
    >
      <h2 id="viewer-heading" className="t-title mb-6">
        everything you parked, one board
      </h2>

      <p className="t-prose">
        the viewer is a board of your projects, each one carrying a
        living status note in your own words — not a commit log. open
        it from your phone as easily as your laptop.
      </p>
      <p className="t-prose mt-4">
        when a task is blocked on a decision, it surfaces in a strip you
        can&apos;t miss: your options, laid out, with a recommendation
        attached. answer it in a tap — the answer travels with the next
        copied prompt.
      </p>
      <p className="t-prose mt-4">
        the idea bag sits right next to the board itself — non-code
        ideas held at the same level as project status, not buried in a
        separate notes app.
      </p>

      <figure className="mt-10 border">
        <Image
          src="/viewer-board.png"
          alt="the www board: project status notes, a blocker waiting on a decision, and the idea bag"
          width={1440}
          height={1100}
          className="block h-auto w-full"
        />
        <figcaption className="border-t rule-faint p-4 text-[13px] text-muted-ink">
          the board — status notes, a blocker waiting on a decision, the
          idea bag
        </figcaption>
      </figure>
    </SampleIn>
  );
}
