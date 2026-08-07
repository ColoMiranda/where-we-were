"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { BrandMarkSmall } from "@/components/brand-mark";
import { ThemeToggle } from "@/components/theme-toggle";
import { logout } from "@/app/login/actions";

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
  const [play, setPlay] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("wwm-played")) return;
    sessionStorage.setItem("wwm-played", "1");
    queueMicrotask(() => setPlay(true));
  }, []);

  if (pathname === "/login") {
    return null;
  }

  return (
    <header className="border-b">
      <div className="mx-auto flex w-full max-w-3xl items-stretch px-6">
        <Link
          href="/"
          className="flex items-center gap-2 py-4 pr-4"
          aria-label="where we were — board"
        >
          <BrandMarkSmall size={16} animate={play} />
          <span className="t-label hidden font-bold whitespace-nowrap tracking-[0.22em] sm:inline">
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
          <form action={logout} className="flex items-stretch">
            <button
              type="submit"
              className="t-label flex items-center border-l px-2.5 hover:bg-foreground hover:text-background sm:px-5"
            >
              OUT
            </button>
          </form>
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
