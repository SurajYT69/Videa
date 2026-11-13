import { Suspense } from "react";
import type { Metadata } from "next";
import { PageHero, heroIds } from "@/components/PageHero";
import { Section } from "@/components/Section";
import { Browse, type BrowseSearchParams } from "@/components/Browse";
import { TrendingRail } from "@/components/TrendingRail";
import { ErrorState } from "@/components/ErrorState";
import {
  HeroSkeleton,
  SectionSkeleton,
  TrendingRailSkeleton,
} from "@/components/LoadingSkeleton";
import { ConfigError, getTrendingByType } from "@/lib/tmdb";

export const metadata: Metadata = {
  title: "TV",
  description: "Browse series by genre, year and rating.",
};

type Props = { searchParams: Promise<BrowseSearchParams> };

async function TrendingShows() {
  let trending;
  try {
    trending = await getTrendingByType("tv");
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
      <PageHero items={trending} eyebrow="Series · Trending now" />
      <Section title="Trending this week" bleed>
        <TrendingRail
          items={trending.filter((item) => !used.has(item.tmdbId)).slice(0, 12)}
          label="Trending series"
        />
      </Section>
    </>
  );
}

export default async function TVPage({ searchParams }: Props) {
  return (
    <>
      <Suspense
        fallback={
          <>
            <HeroSkeleton />
            <SectionSkeleton bleed>
              <TrendingRailSkeleton />
            </SectionSkeleton>
          </>
        }
      >
        <TrendingShows />
      </Suspense>

      <Section
        title="Every series"
        lead="Narrow by genre, year or rating. Filters live in the address bar, so a list stays shareable."
        tone="band"
      >
        <Browse type="tv" searchParams={await searchParams} />
      </Section>
    </>
  );
}
