import { Suspense } from "react";
import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { Section } from "@/components/Section";
import { Browse, type BrowseSearchParams } from "@/components/Browse";
import { TrendingRail } from "@/components/TrendingRail";
import { ErrorState } from "@/components/ErrorState";
import {
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
        title="We can't reach the catalogue."
        description="The metadata service is not responding. Try reloading in a moment."
      />
    );
  }

  return (
    <Section title="Trending this week" eyebrow="Right now" bleed>
      <TrendingRail items={trending.slice(0, 12)} label="Trending series" />
    </Section>
  );
}

export default async function TVPage({ searchParams }: Props) {
  return (
    <>
      <PageHeader
        eyebrow="Television"
        title="Series"
        description="Long-form television, from this week's breakout to the shows that never left."
      />

      <Suspense
        fallback={
          <SectionSkeleton bleed>
            <TrendingRailSkeleton />
          </SectionSkeleton>
        }
      >
        <TrendingShows />
      </Suspense>

      <Section
        title="Every series"
        eyebrow="Browse"
        lead="Narrow by genre, year or rating. Filters live in the address bar, so a list stays shareable."
        tone="band"
      >
        <Browse type="tv" searchParams={await searchParams} />
      </Section>
    </>
  );
}
