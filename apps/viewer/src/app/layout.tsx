import type { Metadata } from "next";
import localFont from "next/font/local";
import { TopBar } from "@/components/top-bar";
import "./globals.css";

const martianMono = localFont({
  src: [{ path: "../fonts/martian-mono-var.woff2", weight: "400 700" }],
  variable: "--font-martian",
  display: "swap",
});

const contract = `<!--
SEED: f567738b (ikeda-datamatics lineage, user-chosen; quieted by user
direction 2026-08-04: barcode glyphs and bar-strips removed, contrast
softened, spacing opened, dual theme added)
THESIS: The board as a quiet data field: every project a measured signal
in one monospace system with room to breathe. Refuses the friendly
card-grid productivity board and the cream-serif briefing before it.
OWN-WORLD: Soft duotone, themeable - near-black field/off-white ink and
warm paper/near-black ink - one muted tier for demoted data, no hue, no
radius, no shadow. Martian Mono only. Pixel-grid texture hashed per
project. Inversion at region scale means one thing:
a decision waits on you.
STORY: Marcos opens cold, reads the field top-down - inverted strip
first (what waits), then project rows with status prose, then the idea
stream and the wins log - answers, copies a prompt, leaves.
FIRST VIEWPORT: Hairline-ruled top bar (wordmark, BOARD/BAG/WINS, theme
switch, date); CAPTURE input; the inverted decisions strip; the airy
projects list with pixel-map signatures, prose notes, counts, and
demoted timestamps.
FORM: Challenger card ikeda-datamatics, round 3 of the direction roll;
softened per explicit user steer, recorded in PRODUCT.md.
FINISH: unreviewed and undocumented is unfinished; this build ends with
the finish review, the verdict, and DESIGN.md
-->`;

// Pre-paint theme resolution: the server always stamps a default value and
// this head script only changes it, so the attribute never appears or
// vanishes across hydration (per the bundled preventing-flash guide).
// AUTO resolves through matchMedia at load.
const themeScript = `(function(){try{var t=localStorage.getItem("www.theme");if(t!=="light"&&t!=="dark"){t=matchMedia("(prefers-color-scheme: light)").matches?"light":"dark"}document.documentElement.setAttribute("data-theme",t)}catch(e){}})()`;

export const metadata: Metadata = {
  title: "where we were",
  description:
    "The memory and staging ground between you and your agents. What's left, and why it stopped.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-theme="dark"
      suppressHydrationWarning
      className={`${martianMono.variable} h-full antialiased`}
    >
      <head>
        {/* text/plain on the client so React re-renders never warn about,
            or attempt to run, an inert script (per the bundled guide). */}
        <script
          type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: themeScript }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <div hidden dangerouslySetInnerHTML={{ __html: contract }} />
        <TopBar />
        {children}
      </body>
    </html>
  );
}
