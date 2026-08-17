"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookmarkSimple,
  List as ListIcon,
  MagnifyingGlass,
  X,
} from "@phosphor-icons/react";
import { SearchBar } from "./SearchBar";
import { Wordmark } from "./Wordmark";

const NAV = [
  { href: "/", label: "Home", match: (p: string) => p === "/" },
  { href: "/movie", label: "Movies", match: (p: string) => p.startsWith("/movie") },
  { href: "/tv", label: "TV", match: (p: string) => p.startsWith("/tv") },
] as const;

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  /* Scroll state comes from a sentinel at the top of the document rather than
     a scroll listener, so nothing runs per frame. */
  useEffect(() => {
    const sentinel = document.querySelector("[data-scroll-sentinel]");
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      ([entry]) => setScrolled(!entry?.isIntersecting),
      { rootMargin: "0px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  /* Close everything on navigation. */
  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  /* Escape closes the drawer; the page behind it must not scroll. */
  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-colors duration-300 ${
        scrolled || searchOpen
          ? "border-b border-line bg-ink/80 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      {/* Keeps nav and search legible over bright artwork before any scroll. */}
      {!scrolled && !searchOpen && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-28 bg-gradient-to-b from-ink/90 via-ink/50 to-transparent"
        />
      )}

      <div className="page flex h-16 items-center gap-6 md:h-[76px] lg:gap-10">
        <Link href="/" className="shrink-0 rounded-mini">
          <Wordmark />
          <span className="sr-only">Videa home</span>
        </Link>

        <nav aria-label="Primary" className="hidden md:block">
          <ul className="flex items-center gap-7">
            {NAV.map((item) => {
              const active = item.match(pathname);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`relative py-1 text-sm transition-colors duration-200 ${
                      active ? "text-fg" : "text-fg-3 hover:text-fg"
                    }`}
                  >
                    {item.label}
                    {active && (
                      <span className="brand-bar absolute -bottom-1.5 left-0 h-[3px] w-full rounded-full" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Search is the product's main verb, so it gets the centre weight. */}
        <div className="ml-auto hidden min-w-0 flex-1 justify-end md:flex lg:mx-4 lg:justify-center">
          <SearchBar />
        </div>

        <div className="ml-auto flex items-center gap-1 md:ml-0 md:gap-2">
          <Link
            href="/my-list"
            className="hidden items-center gap-2 rounded-card px-3 py-2 text-sm text-fg-3 transition-colors hover:text-fg md:inline-flex"
          >
            <BookmarkSimple className="size-4" aria-hidden="true" />
            My List
          </Link>

          <button
            type="button"
            onClick={() => setSearchOpen((open) => !open)}
            aria-expanded={searchOpen}
            className="grid size-11 place-items-center rounded-card text-fg-2 transition-colors hover:text-fg md:hidden"
          >
            {searchOpen ? (
              <X className="size-5" aria-hidden="true" />
            ) : (
              <MagnifyingGlass className="size-5" aria-hidden="true" />
            )}
            <span className="sr-only">
              {searchOpen ? "Close search" : "Open search"}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-expanded={menuOpen}
            className="grid size-11 place-items-center rounded-card text-fg-2 transition-colors hover:text-fg md:hidden"
          >
            <ListIcon className="size-5" aria-hidden="true" />
            <span className="sr-only">Open menu</span>
          </button>
        </div>
      </div>

      {searchOpen && (
        <div className="page animate-drop pb-3 md:hidden">
          <SearchBar autoFocus variant="block" />
        </div>
      )}

      {menuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            onClick={() => setMenuOpen(false)}
            /* Scrim behind the drawer: it has to dim the page, so it takes the
               ground rather than the foreground. `bg-fg` only read as a dim
               because the foreground happened to be the dark end of the pair. */
            className="animate-fade absolute inset-0 bg-ink/70 backdrop-blur-sm"
          >
            <span className="sr-only">Close menu</span>
          </button>

          <nav
            aria-label="Mobile"
            className="animate-drop absolute inset-x-0 top-0 border-b border-line bg-raised px-5 pt-5 pb-10"
          >
            <div className="flex items-center justify-between">
              <Wordmark />
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="grid size-11 place-items-center rounded-card text-fg-2 hover:text-fg"
              >
                <X className="size-5" aria-hidden="true" />
                <span className="sr-only">Close menu</span>
              </button>
            </div>

            <ul className="mt-8 divide-y divide-line">
              {[...NAV, { href: "/my-list", label: "My List" }].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="display block py-4 text-2xl text-fg"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      )}
    </header>
  );
}
