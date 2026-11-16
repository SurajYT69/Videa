"use client";

import { useSyncExternalStore } from "react";
import { Section } from "./Section";
import { MediaCard } from "./MediaCard";
import { MediaGrid } from "./MediaGrid";
import { ContinueWatchingCard } from "./ContinueWatchingCard";
import { EmptyState } from "./EmptyState";
import { Rail } from "./Rail";
import { useLibrary } from "@/lib/useLibrary";
import { fromStub } from "@/lib/stub";

type Props = {
  /** Home hides these entirely when empty; My List explains what goes here. */
  showWhenEmpty?: boolean;
  tone?: "ground" | "band";
};

export function ContinueWatchingSection({
  showWhenEmpty = false,
  tone = "ground",
}: Props) {
  const { continueWatching } = useLibrary();

  if (!continueWatching.length) {
    if (!showWhenEmpty) return null;
    return (
      <Section title="Continue watching" tone={tone}>
        <EmptyState
          title="Nothing in progress"
          description="Anything you start playing shows up here so you can pick it back up on this device."
          action={{ href: "/", label: "Find something to watch" }}
        />
      </Section>
    );
  }

  return (
    <Section
      title="Continue watching"
      tone={tone}
      bleed
    >
      <Rail label="Continue watching">
        {continueWatching.map((item) => (
          <div
            key={`${item.type}-${item.tmdbId}`}
            className="rail-item w-[280px] md:w-[360px]"
          >
            <ContinueWatchingCard item={item} />
          </div>
        ))}
      </Rail>
    </Section>
  );
}

export function FavoritesSection({
  showWhenEmpty = false,
  tone = "ground",
}: Props) {
  const { favorites } = useLibrary();

  if (!favorites.length) {
    if (!showWhenEmpty) return null;
    return (
      <Section title="Favorites" tone={tone}>
        <EmptyState
          title="Nothing saved yet"
          description="Find something worth watching and save it from any title page. It stays on this device."
          action={{ href: "/movie", label: "Explore movies" }}
        />
      </Section>
    );
  }

  return (
    <Section title="Favorites" tone={tone}>
      <MediaGrid items={favorites.map(fromStub)} />
    </Section>
  );
}

export function RecentlyViewedSection({
  showWhenEmpty = false,
  tone = "ground",
}: Props) {
  const { recentlyViewed } = useLibrary();

  if (!recentlyViewed.length) {
    if (!showWhenEmpty) return null;
    return (
      <Section title="Recently viewed" tone={tone}>
        <EmptyState
          title="Nothing opened yet"
          description="Titles you open are listed here, newest first."
        />
      </Section>
    );
  }

  /* A compact strip: history is reference material, not a headline. */
  return (
    <Section title="Recently viewed" tone={tone} bleed>
      <Rail label="Recently viewed">
        {recentlyViewed.map((item) => (
          <div
            key={`${item.type}-${item.tmdbId}`}
            className="rail-item w-[112px] md:w-[128px]"
          >
            {/* Measured: 112px phone, 128px md up. */}
            <MediaCard
              media={fromStub(item)}
              sizes="(min-width: 768px) 128px, 112px"
            />
          </div>
        ))}
      </Rail>
    </Section>
  );
}
/** False on the server and during hydration, true once LocalStorage is readable. */
const noop = () => () => {};
function useHydrated() {
  return useSyncExternalStore(noop, () => true, () => false);
}

/**
 * The opener for My List. The page's job is "pick up where I was", so the
 * counts double as the table of contents: each jumps to its own section.
 * Counts appear only once this browser's list has been read; a server-
 * rendered 0 that turns into 12 reads as data loss.
 */
export function LibraryHeader() {
  const hydrated = useHydrated();
  const { continueWatching, favorites, recentlyViewed } = useLibrary();
  const stats: Array<[string, string, number]> = [
    ["continue", "in progress", continueWatching.length],
    ["saved", "saved", favorites.length],
    ["viewed", "viewed", recentlyViewed.length],
  ];

  return (
    <div className="page pt-32 pb-4 md:pt-40">
      <p className="eyebrow">On this device</p>
      <h1 className="display display-page mt-5 text-fg">My List</h1>
      <p className="mt-5 max-w-[46ch] text-[15px] leading-relaxed text-fg-2">
        What you saved, started and opened, kept in this browser. No account
        holds a copy.
      </p>
      <nav
        aria-label="My List sections"
        className={`mt-8 flex min-h-6 flex-wrap gap-x-6 gap-y-2 transition-opacity duration-300 ${
          hydrated ? "opacity-100" : "opacity-0"
        }`}
      >
        {hydrated &&
          stats.map(([id, label, count]) => (
            <a
              key={id}
              href={`#${id}`}
              className="meta tabular-nums transition-colors duration-200 hover:text-fg"
            >
              <span className="text-fg">{count.toLocaleString("en-US")}</span> {label}
            </a>
          ))}
      </nav>
    </div>
  );
}

/**
 * The three My List sections, or one invitation when all three are empty:
 * three stacked "nothing here" blocks on a first visit read as a broken page.
 * Renders nothing until hydrated, so a returning viewer never sees the empty
 * version flash before their list.
 */
export function MyListSections() {
  const hydrated = useHydrated();
  const { continueWatching, favorites, recentlyViewed } = useLibrary();

  if (!hydrated) return <div className="min-h-[40svh]" />;

  if (!continueWatching.length && !favorites.length && !recentlyViewed.length) {
    return (
      <div className="page pt-6 pb-20">
        <EmptyState
          title="Nothing here yet"
          description="Save a title, or start one playing, and it lands here. Only this browser keeps it."
          action={{ href: "/movie", label: "Explore movies" }}
          secondary={{ href: "/tv", label: "Browse series" }}
        />
      </div>
    );
  }

  return (
    <>
      <div id="continue" className="scroll-mt-16">
        <ContinueWatchingSection showWhenEmpty />
      </div>
      <div id="saved" className="scroll-mt-16">
        <FavoritesSection showWhenEmpty tone="band" />
      </div>
      <div id="viewed" className="scroll-mt-16">
        <RecentlyViewedSection showWhenEmpty />
      </div>
    </>
  );
}
