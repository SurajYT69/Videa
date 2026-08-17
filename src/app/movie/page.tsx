import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { Section } from "@/components/Section";
import { MediaGrid } from "@/components/MediaGrid";
import { PosterRail } from "@/components/PosterRail";
import { ErrorState } from "@/components/ErrorState";
import { ConfigError, getPopularMovies, getTrendingByType } from "@/lib/tmdb";

export const metadata: Metadata = {
  title: "Movies",
  description: "Trending and popular films, updated weekly.",
};

export default async function MoviesPage() {
  let trending, popular;

  try {
    [trending, popular] = await Promise.all([
      getTrendingByType("movie"),
      getPopularMovies(),
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
        title="Movies"
        description="What the world is watching this week, and what stays popular after the noise dies down."
      />

      <Section title="Trending this week" bleed>
        <PosterRail items={trending.slice(0, 16)} />
      </Section>

      <Section title="Popular now">
        <MediaGrid items={popular.slice(0, 24)} priorityCount={6} />
      </Section>
    </>
  );
}
