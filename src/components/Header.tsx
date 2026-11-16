"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookmarkSimple,
  FilmSlate,
  Ghost,
  House,
  MagnifyingGlass,
  TelevisionSimple,
  X,
} from "@phosphor-icons/react";
import type { Icon } from "@phosphor-icons/react";
import { MotionConfig, motion } from "motion/react";
import { SearchBar } from "./SearchBar";
import { EyesMark, Wordmark } from "./Wordmark";
import { ThemeSwitch } from "./ThemeSwitch";

type Item = {
  href: string;
  label: string;
  icon: Icon;
  /** Hover gesture for the rail glyph, see `.rail-glyph` in globals.css. */
  motion: "lift" | "clap" | "tune" | "float" | "seek" | "drop";
  match: (pathname: string) => boolean;
};

const NAV: Item[] = [
  { href: "/", label: "Home", icon: House, motion: "lift", match: (p) => p === "/" },
  {
    href: "/movie",
    label: "Movies",
    icon: FilmSlate,
    motion: "clap",
    match: (p) => p.startsWith("/movie") || p.startsWith("/watch/movie"),
  },
  {
    href: "/tv",
    label: "TV",
    icon: TelevisionSimple,
    motion: "tune",
    match: (p) => p.startsWith("/tv") || p.startsWith("/watch/tv"),
  },
  {
    href: "/anime",
    label: "Anime",
    icon: Ghost,
    motion: "float",
    match: (p) => p.startsWith("/anime"),
  },
];

const TOOLS: Item[] = [
  {
    href: "/search",
    label: "Search",
    icon: MagnifyingGlass,
    motion: "seek",
    match: (p) => p.startsWith("/search"),
  },
  {
    href: "/my-list",
    label: "My List",
    icon: BookmarkSimple,
    motion: "drop",
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
 * Below `md` it is a top bar (logo, theme, search) plus a bottom tab bar,
 * because a rail costs a phone a fifth of its width and a drawer hides the
 * destinations behind a tap.
 */
export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
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
    setSearchOpen(false);
  }, [pathname]);

  return (
    /* Critically damped everywhere: the indicator settles, it never wobbles.
       reducedMotion="user" turns the slides off under the OS setting. */
    <MotionConfig transition={SPRING} reducedMotion="user">
      {/* ---------------------------------------------------------------- rail */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-18 flex-col items-center bg-gradient-to-r from-ink via-ink/80 to-transparent py-5 md:flex">
        <Link href="/" className="group grid size-11 place-items-center rounded-card">
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

        <div className="mt-auto mb-2 grid place-items-center">
          <ThemeSwitch />
        </div>

        <nav aria-label="Search and library">
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

        <div className="page flex h-16 items-center gap-6 box-content pt-[env(safe-area-inset-top)]">
          <Link href="/" className="group shrink-0 rounded-mini">
            <Wordmark />
            <span className="sr-only">oovi home</span>
          </Link>

          <div className="ml-auto flex items-center gap-1">
            <ThemeSwitch />
            <button
              type="button"
              onClick={() => setSearchOpen((open) => !open)}
              aria-expanded={searchOpen}
              className="grid size-11 place-items-center rounded-card text-fg-2 transition-[color,scale] duration-100 hover:text-fg active:scale-90 motion-reduce:active:scale-100"
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
          </div>
        </div>

        {searchOpen && (
          <div className="page animate-drop pb-3">
            <SearchBar autoFocus variant="block" />
          </div>
        )}
      </header>

      {/* ------------------------------------------------------ phone tabs */}
      {/* A floating capsule rather than a full-width strip, so artwork runs
          past it. The active tab widens into a pill with its label; the rest
          stay icons. */}
      <nav
        aria-label="Primary"
        className="fixed inset-x-0 bottom-[calc(0.75rem+env(safe-area-inset-bottom))] z-40 flex justify-center px-3 md:hidden"
      >
        <ul className="glass-panel flex items-center gap-1 rounded-full p-1.5 shadow-lift">
          {TABS.map((item) => (
            <li key={item.href}>
              <TabLink item={item} active={item.match(pathname)} />
            </li>
          ))}
        </ul>
      </nav>
    </MotionConfig>
  );
}

/* Search lives in the phone's top bar, so the tabs are the places. */
const TABS: Item[] = [...NAV, TOOLS[1]!];

const SPRING = { type: "spring", bounce: 0, duration: 0.35 } as const;

/** One phone tab. Only the active one shows its label. */
function TabLink({ item, active }: { item: Item; active: boolean }) {
  const Glyph = item.icon;
  return (
    <motion.div layout="position">
      <Link
        href={item.href}
        aria-current={active ? "page" : undefined}
        className={`relative flex h-11 items-center gap-2 rounded-full text-sm font-medium transition-[color,scale] duration-100 active:scale-95 motion-reduce:active:scale-100 ${
          active ? "px-4 text-ink" : "w-11 justify-center text-fg-2"
        }`}
      >
        {active && (
          <motion.span
            layoutId="tab-pill"
            aria-hidden="true"
            className="absolute inset-0 rounded-full bg-fg"
          />
        )}
        <Glyph
          weight={active ? "fill" : "regular"}
          className="relative size-5 shrink-0"
          aria-hidden="true"
        />
        {active ? (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative whitespace-nowrap"
          >
            {item.label}
          </motion.span>
        ) : (
          <span className="sr-only">{item.label}</span>
        )}
      </Link>
    </motion.div>
  );
}

/**
 * One rail destination. The raised disc and the accent tick slide between
 * items rather than blinking, so the eye follows where you went. The label
 * grows out of the icon on hover, origin on its left edge.
 */
function RailLink({ item, active }: { item: Item; active: boolean }) {
  const Glyph = item.icon;
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={`group relative grid size-11 place-items-center rounded-full transition-[color,scale] duration-100 active:scale-95 motion-reduce:active:scale-100 ${
        active ? "text-fg" : "text-fg-3 hover:text-fg"
      }`}
    >
      {active && (
        <>
          <motion.span
            layoutId="rail-disc"
            aria-hidden="true"
            className="absolute inset-0 rounded-full border border-line bg-raised"
          />
          <motion.span
            layoutId="rail-tick"
            aria-hidden="true"
            /* 14px: the gap from the 44px button to the edge of the 72px rail. */
            className="absolute top-1/2 -left-3.5 h-5 w-0.5 -translate-y-1/2 bg-accent"
          />
        </>
      )}
      <span className="rail-glyph relative" data-motion={item.motion}>
        <Glyph weight={active ? "fill" : "regular"} className="size-5" aria-hidden="true" />
      </span>
      <span
        aria-hidden="true"
        className="glass-panel pointer-events-none absolute top-1/2 left-full ml-3 origin-left -translate-y-1/2 scale-95 rounded-full px-3 py-1.5 text-xs whitespace-nowrap text-fg opacity-0 transition-[opacity,scale] duration-150 ease-out group-hover:scale-100 group-hover:opacity-100 group-focus-visible:scale-100 group-focus-visible:opacity-100"
      >
        {item.label}
      </span>
      <span className="sr-only">{item.label}</span>
    </Link>
  );
}
