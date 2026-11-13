import { Suspense } from "react";
import type { Metadata } from "next";
import { PageHero, heroIds } from "@/components/PageHero";
import { Section } from "@/components/Section";
import { Browse, type BrowseSearchParams } from "@/components/Browse";
import { PosterRail } from "@/components/PosterRail";
import { ErrorState } from "@/components/ErrorState";
import {
  HeroSkeleton,
  PosterRailSkeleton,
  SectionSkeleton,
} from "@/components/LoadingSkeleton";
import { ConfigError, getTrendingByType } from "@/lib/tmdb";

export const metadata: Metadata = {
  title: "Movies",
  description: "Browse films by genre, year and rating.",
};

type Props = { searchParams: Promise<BrowseSearchParams> };

async function TrendingMovies() {
  let trending;
  try {
    trending = await getTrendingByType("movie");
  } catch (error) {
    if (error instanceof ConfigError) throw error;
    return (
      <ErrorState
        title="We can't reach the catalogue"
        description="The metadata service is not responding. Try reloading in a moment."
      />
    );
  }

  /* The slider takes the first five with artwork; the rail carries the rest. */
  const used = heroIds(trending);
  return (
    <>
      <PageHero items={trending} eyebrow="Movies · Trending now" />
      <Section title="Trending this week" bleed>
        <PosterRail
          items={trending.filter((item) => !used.has(item.tmdbId)).slice(0, 16)}
          label="Trending movies"
        />
      </Section>
    </>
  );
}

export default async function MoviesPage({ searchParams }: Props) {
  return (
    <>
      <Suspense
        fallback={
          <>
            <HeroSkeleton />
            <SectionSkeleton bleed>
              <PosterRailSkeleton />
            </SectionSkeleton>
          </>
        }
      >
        <TrendingMovies />
      </Suspense>

      <Section
        title="Every film"
        lead="Narrow by genre, year or rating. Filters live in the address bar, so a list stays shareable."
        tone="band"
      >
        <Browse type="movie" searchParams={await searchParams} />
      </Section>
    </>
  );
}
