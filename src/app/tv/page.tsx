import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { Section } from "@/components/Section";
import { MediaGrid } from "@/components/MediaGrid";
import { TrendingRail } from "@/components/TrendingRail";
import { ErrorState } from "@/components/ErrorState";
import { ConfigError, getPopularTV, getTrendingByType } from "@/lib/tmdb";

export const metadata: Metadata = {
  title: "TV",
  description: "Trending and popular series, updated weekly.",
};

export default async function TVPage() {
  let trending, popular;

  try {
    [trending, popular] = await Promise.all([
      getTrendingByType("tv"),
      getPopularTV(),
    ]);
  } catch (error) {
    if (error instanceof ConfigError) throw error;
    return (
      <ErrorState
        title="We can't reach the catalogue."
        description="The metadata service is not responding. Try reloading in a moment."
      />
    );
  }

  return (
    <>
      <PageHeader
        title="Series"
        description="Long-form television, from this week's breakout to the shows people keep returning to."
      />

      <Section title="Trending this week" bleed>
        <TrendingRail items={trending.slice(0, 14)} />
      </Section>

      <Section title="Popular now">
        <MediaGrid items={popular.slice(0, 24)} priorityCount={6} />
      </Section>
    </>
  );
}
