"use client";

import { Section } from "./Section";
import { MediaCard } from "./MediaCard";
import { MediaGrid } from "./MediaGrid";
import { ContinueWatchingCard } from "./ContinueWatchingCard";
import { EmptyState } from "./EmptyState";
import { useLibrary } from "@/lib/useLibrary";
import { fromStub } from "@/lib/stub";

type Props = {
  /** Home hides these entirely when empty; My List explains what goes here. */
  showWhenEmpty?: boolean;
};

export function ContinueWatchingSection({ showWhenEmpty = false }: Props) {
  const { continueWatching } = useLibrary();

  if (!continueWatching.length) {
    if (!showWhenEmpty) return null;
    return (
      <Section title="Continue Watching">
        <EmptyState
          title="Nothing in progress."
          description="Anything you start playing shows up here so you can pick it back up."
        />
      </Section>
    );
  }

  return (
    <Section title="Continue Watching" bleed>
      <div className="rail rail-gutter gap-4 pb-2">
        {continueWatching.map((item) => (
          <div
            key={`${item.type}-${item.tmdbId}`}
            className="rail-item w-[268px] md:w-[340px]"
          >
            <ContinueWatchingCard item={item} />
          </div>
        ))}
      </div>
    </Section>
  );
}

export function FavoritesSection({ showWhenEmpty = false }: Props) {
  const { favorites } = useLibrary();

  if (!favorites.length) {
    if (!showWhenEmpty) return null;
    return (
      <Section title="My Favorites">
        <EmptyState
          title="Nothing saved yet."
          description="Find something worth watching and save it from any title page."
          action={{ href: "/movie", label: "Explore movies" }}
        />
      </Section>
    );
  }

  return (
    <Section title="My Favorites">
      <MediaGrid items={favorites.map(fromStub)} />
    </Section>
  );
}

export function RecentlyViewedSection({ showWhenEmpty = false }: Props) {
  const { recentlyViewed } = useLibrary();

  if (!recentlyViewed.length) {
    if (!showWhenEmpty) return null;
    return (
      <Section title="Recently Viewed">
        <EmptyState
          title="Your viewing history is empty."
          description="Titles you open are listed here, newest first."
        />
      </Section>
    );
  }

  /* A compact strip: history is reference material, not a headline. */
  return (
    <Section title="Recently Viewed" bleed>
      <div className="rail rail-gutter gap-4 pb-2">
        {recentlyViewed.map((item) => (
          <div
            key={`${item.type}-${item.tmdbId}`}
            className="rail-item w-[104px] md:w-[120px]"
          >
            <MediaCard media={fromStub(item)} sizes="120px" />
          </div>
        ))}
      </div>
    </Section>
  );
}
