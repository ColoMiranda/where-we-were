import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const martianMono = localFont({
  src: [{ path: "../fonts/martian-mono-var.woff2", weight: "400 700" }],
  variable: "--font-martian",
  display: "swap",
});

// Pre-paint theme resolution: the server always stamps a default value and
// this head script only changes it, so the attribute never appears or
// vanishes across hydration (per the bundled preventing-flash guide).
// AUTO resolves through matchMedia at load. Ported verbatim from
// apps/viewer/src/app/layout.tsx.
const themeScript = `(function(){try{var t=localStorage.getItem("www.theme");if(t!=="light"&&t!=="dark"){t=matchMedia("(prefers-color-scheme: light)").matches?"light":"dark"}document.documentElement.setAttribute("data-theme",t)}catch(e){}})()`;

export const metadata: Metadata = {
  title: "www — where we were: memory for you and your coding agents",
  description:
    "Open-source, self-hosted memory between you and your coding agents. Park what's left, answer blockers from your phone, copy the task back into any agent. MIT licensed.",
  openGraph: {
    title: "www — where we were: memory for you and your coding agents",
    description:
      "git records what happened. this records what's left and why it stopped.",
  },
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
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
