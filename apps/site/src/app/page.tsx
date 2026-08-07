import { CopyPrompt } from "@/components/sections/copy-prompt";
import { Footer } from "@/components/sections/footer";
import { Hero } from "@/components/sections/hero";
import { Loop } from "@/components/sections/loop";
import { Pieces } from "@/components/sections/pieces";
import { Problem } from "@/components/sections/problem";
import { SelfHost } from "@/components/sections/selfhost";
import { Viewer } from "@/components/sections/viewer";
import { Why } from "@/components/sections/why";

/**
 * The one page. Section order follows WEBSITE-BRIEF.md §5 exactly: hero,
 * loop, problem, pieces, copy-prompt, viewer, why, self-host, footer.
 * Single centered column (DESIGN.md Layout) — the max-w-3xl/px-6 wrapper
 * lives here, once, rather than duplicated inside each section.
 */
export default function Home() {
  return (
    <>
      <main className="mx-auto w-full max-w-3xl px-6">
        <Hero />
        <Loop />
        <Problem />
        <Pieces />
        <CopyPrompt />
        <Viewer />
        <Why />
        <SelfHost />
      </main>
      <Footer />
    </>
  );
}
