"use client";

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
          title="Your viewing history is empty"
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
/**
 * The opener for My List: what it is, and what this browser holds, as three
 * counts. There is no account behind any of it.
 */
export function LibraryHeader() {
  const { continueWatching, favorites, recentlyViewed } = useLibrary();
  const stats: Array<[string, number]> = [
    ["In progress", continueWatching.length],
    ["Saved", favorites.length],
    ["Viewed", recentlyViewed.length],
  ];

  return (
    <div className="page pt-24 md:pt-20">
      <div className="glass flex flex-wrap items-center justify-between gap-6 rounded-card p-6 md:p-8">
        <div>
          <h1 className="display text-3xl text-fg md:text-4xl">My List</h1>
          <p className="mt-3 max-w-[52ch] text-sm leading-relaxed text-fg-2">
            Saved locally in this browser. No account, no server copy, nothing
            to sign into.
          </p>
        </div>

        <dl className="flex gap-3">
          {stats.map(([label, count]) => (
            <div
              key={label}
              className="glass flex min-w-24 flex-col-reverse rounded-card px-4 py-3 text-center"
            >
              <dt className="meta mt-1">{label}</dt>
              <dd className="display text-2xl text-fg tabular-nums">{count}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
