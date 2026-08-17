import { Suspense } from "react";
import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { Section } from "@/components/Section";
import { MediaGrid } from "@/components/MediaGrid";
import { TrendingRail } from "@/components/TrendingRail";
import { ErrorState } from "@/components/ErrorState";
import {
  GridSkeleton,
  SectionSkeleton,
  TrendingRailSkeleton,
} from "@/components/LoadingSkeleton";
import { ConfigError, getPopularTV, getTrendingByType } from "@/lib/tmdb";

export const metadata: Metadata = {
  title: "TV",
  description: "Trending and popular series, updated weekly.",
};

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

async function PopularShows() {
  const popular = await getPopularTV().catch(() => []);
  if (!popular.length) return null;

  return (
    <Section
      title="Popular now"
      eyebrow="Long-running"
      lead="Series people keep returning to, season after season."
      tone="band"
    >
      {/* Below the fold behind the page header and the trending rail. */}
      <MediaGrid items={popular.slice(0, 24)} />
    </Section>
  );
}

export default function TVPage() {
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

      <Suspense
        fallback={
          <SectionSkeleton>
            <GridSkeleton count={12} />
          </SectionSkeleton>
        }
      >
        <PopularShows />
      </Suspense>
    </>
  );
}
