import { Suspense } from "react";
import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { Section } from "@/components/Section";
import { MediaGrid } from "@/components/MediaGrid";
import { PosterRail } from "@/components/PosterRail";
import { ErrorState } from "@/components/ErrorState";
import {
  GridSkeleton,
  PosterRailSkeleton,
  SectionSkeleton,
} from "@/components/LoadingSkeleton";
import { ConfigError, getPopularMovies, getTrendingByType } from "@/lib/tmdb";

export const metadata: Metadata = {
  title: "Movies",
  description: "Trending and popular films, updated weekly.",
};

async function TrendingMovies() {
  let trending;
  try {
    trending = await getTrendingByType("movie");
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
    <Section title="Trending this week" eyebrow="Right now" bleed>
      <PosterRail items={trending.slice(0, 16)} label="Trending movies" />
    </Section>
  );
}

async function PopularMovies() {
  const popular = await getPopularMovies().catch(() => []);
  if (!popular.length) return null;

  return (
    <Section
      title="Popular now"
      eyebrow="Steady favourites"
      lead="Films that hold their audience after the release week noise dies down."
      tone="band"
    >
      {/*
        No priority. Measured, this grid starts around 1140px on a 900px-tall
        window: it is below the fold behind the page header and the trending
        rail, so eager posters here only crowd the optimizer.
      */}
      <MediaGrid items={popular.slice(0, 24)} />
    </Section>
  );
}

export default function MoviesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Film"
        title="Movies"
        description="What the world is watching this week, and what stays popular long after."
      />

      <Suspense
        fallback={
          <SectionSkeleton bleed>
            <PosterRailSkeleton />
          </SectionSkeleton>
        }
      >
        <TrendingMovies />
      </Suspense>

      <Suspense
        fallback={
          <SectionSkeleton>
            <GridSkeleton count={12} />
          </SectionSkeleton>
        }
      >
        <PopularMovies />
      </Suspense>
    </>
  );
}
