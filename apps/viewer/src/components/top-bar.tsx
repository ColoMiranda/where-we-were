"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";

const links = [
  { href: "/", label: "BOARD" },
  { href: "/bag", label: "BAG" },
  { href: "/wins", label: "WINS" },
];

function dateIndex() {
  return new Date()
    .toLocaleDateString("en-GB", {
      weekday: "short",
      day: "2-digit",
      month: "short",
    })
    .toUpperCase();
}

export function TopBar() {
  const pathname = usePathname();

  return (
    <header className="border-b">
      <div className="mx-auto flex w-full max-w-3xl items-stretch px-6">
        <Link
          href="/"
          className="flex items-center py-4 pr-4"
          aria-label="where we were — board"
        >
          <span className="t-label font-bold whitespace-nowrap tracking-[0.18em] sm:tracking-[0.22em]">
            WHERE WE WERE
          </span>
        </Link>
        <nav aria-label="Primary" className="ml-auto flex items-stretch">
          {links.map(({ href, label }) => {
            const active =
              href === "/"
                ? pathname === "/" || pathname.startsWith("/project")
                : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`t-label flex items-center border-l px-2.5 sm:px-5 ${
                  active
                    ? "inverted bg-foreground text-background"
                    : "hover:bg-foreground hover:text-background"
                }`}
              >
                {label}
              </Link>
            );
          })}
          <ThemeToggle />
          <span
            suppressHydrationWarning
            className="t-data hidden items-center border-l pl-5 lg:flex"
          >
            {dateIndex()}
          </span>
        </nav>
      </div>
    </header>
  );
}
