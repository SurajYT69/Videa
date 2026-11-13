"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookmarkSimple,
  FilmSlate,
  House,
  List as ListIcon,
  MagnifyingGlass,
  TelevisionSimple,
  X,
} from "@phosphor-icons/react";
import type { Icon } from "@phosphor-icons/react";
import { SearchBar } from "./SearchBar";
import { EyesMark, Wordmark } from "./Wordmark";

type Item = {
  href: string;
  label: string;
  icon: Icon;
  match: (pathname: string) => boolean;
};

const NAV: Item[] = [
  { href: "/", label: "Home", icon: House, match: (p) => p === "/" },
  {
    href: "/movie",
    label: "Movies",
    icon: FilmSlate,
    match: (p) => p.startsWith("/movie") || p.startsWith("/watch/movie"),
  },
  {
    href: "/tv",
    label: "TV",
    icon: TelevisionSimple,
    match: (p) => p.startsWith("/tv") || p.startsWith("/watch/tv"),
  },
];

const TOOLS: Item[] = [
  {
    href: "/search",
    label: "Search",
    icon: MagnifyingGlass,
    match: (p) => p.startsWith("/search"),
  },
  {
    href: "/my-list",
    label: "My List",
    icon: BookmarkSimple,
    match: (p) => p.startsWith("/my-list"),
  },
];

/**
 * Two shells, one component.
 *
 * From `md` up the navigation is an icon rail down the left edge, and search
 * sits at the top of the page rather than in a bar. The rail is transparent
 * over artwork, so heroes run underneath it.
 *
 * Below `md` it is a top bar with a drawer, because a rail costs a phone a
 * fifth of its width.
 */
export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  /* Scroll state comes from a sentinel at the top of the document rather than
     a scroll listener, so nothing runs per frame. Only the phone bar uses it. */
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
    <>
      {/* ---------------------------------------------------------------- rail */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-18 flex-col items-center bg-gradient-to-r from-ink via-ink/80 to-transparent py-5 md:flex">
        <Link href="/" className="grid size-11 place-items-center rounded-card">
          <EyesMark className="h-4 w-auto" />
          <span className="sr-only">oovi home</span>
        </Link>

        <nav aria-label="Primary" className="mt-8">
          <ul className="flex flex-col gap-1">
            {NAV.map((item) => (
              <li key={item.href}>
                <RailLink item={item} active={item.match(pathname)} />
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Search and library" className="mt-auto">
          <ul className="flex flex-col gap-1">
            {TOOLS.map((item) => (
              <li key={item.href}>
                <RailLink item={item} active={item.match(pathname)} />
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Search is the product's main verb. It opens the page, top centre, and
          scrolls away with it; the rail's search icon is always in reach. */}
      <div className="pointer-events-none absolute inset-x-0 top-4 z-30 hidden justify-center md:flex md:pl-18">
        <div className="pointer-events-auto flex w-full max-w-md justify-center">
          <SearchBar />
        </div>
      </div>

      {/* --------------------------------------------------------- phone bar */}
      <header
        className={`fixed inset-x-0 top-0 z-40 transition-colors duration-300 md:hidden ${
          scrolled || searchOpen
            ? "border-b border-line bg-ink/80 backdrop-blur-xl"
            : "border-b border-transparent bg-transparent"
        }`}
      >
        {/* Keeps the bar legible over bright artwork before any scroll. */}
        {!scrolled && !searchOpen && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-28 bg-gradient-to-b from-ink/90 via-ink/50 to-transparent"
          />
        )}

        <div className="page flex h-16 items-center gap-6">
          <Link href="/" className="shrink-0 rounded-mini">
            <Wordmark />
            <span className="sr-only">oovi home</span>
          </Link>

          <div className="ml-auto flex items-center gap-1">
            <button
              type="button"
              onClick={() => setSearchOpen((open) => !open)}
              aria-expanded={searchOpen}
              className="grid size-11 place-items-center rounded-card text-fg-2 transition-colors hover:text-fg"
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
              className="grid size-11 place-items-center rounded-card text-fg-2 transition-colors hover:text-fg"
            >
              <ListIcon className="size-5" aria-hidden="true" />
              <span className="sr-only">Open menu</span>
            </button>
          </div>
        </div>

        {searchOpen && (
          <div className="page animate-drop pb-3">
            <SearchBar autoFocus variant="block" />
          </div>
        )}

        {menuOpen && (
          <div className="fixed inset-0 z-50">
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              /* Scrim behind the drawer: it has to dim the page, so it takes
                 the ground rather than the foreground. */
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
                {[...NAV, ...TOOLS].map((item) => (
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
    </>
  );
}

/** One rail destination. The accent tick on the rail's edge marks where you are. */
function RailLink({ item, active }: { item: Item; active: boolean }) {
  const Glyph = item.icon;
  return (
    <Link
      href={item.href}
      title={item.label}
      aria-current={active ? "page" : undefined}
      className={`relative grid size-11 place-items-center rounded-card transition-colors duration-200 ${
        active ? "text-fg" : "text-fg-3 hover:text-fg"
      }`}
    >
      {active && (
        <span
          aria-hidden="true"
          /* 14px: the gap from the 44px button to the edge of the 72px rail. */
          className="absolute top-1/2 -left-3.5 h-5 w-0.5 -translate-y-1/2 bg-accent"
        />
      )}
      <Glyph weight={active ? "fill" : "regular"} className="size-5" aria-hidden="true" />
      <span className="sr-only">{item.label}</span>
    </Link>
  );
}
