import { Suspense } from "react";
import { Hero } from "@/components/Hero";
import { Section } from "@/components/Section";
import { PosterRail } from "@/components/PosterRail";
import { TrendingRail } from "@/components/TrendingRail";
import {
  ContinueWatchingSection,
  RecentlyViewedSection,
} from "@/components/LibrarySections";
import { ErrorState } from "@/components/ErrorState";
import {
  HeroSkeleton,
  PosterRailSkeleton,
  SectionSkeleton,
  TrendingRailSkeleton,
} from "@/components/LoadingSkeleton";
import {
  ConfigError,
  getPopularMovies,
  getPopularTV,
  getTrending,
} from "@/lib/tmdb";

/*
 * Each block awaits only its own request and streams in on its own. The hero
 * no longer waits for the popular-movie and popular-series lists, so first
 * paint is one TMDB round trip rather than the slowest of three.
 */

async function HeroAndTrending() {
  let trending;
  try {
    trending = await getTrending();
  } catch (error) {
    if (error instanceof ConfigError) throw error;
    return (
      <ErrorState
        title="We can't reach the catalogue."
        description="The metadata service is not responding. Try reloading in a moment."
      />
    );
  }

  /* The hero needs artwork wide enough to hold a composition. */
  const hero = trending.find((item) => item.backdropPath) ?? trending[0];
  if (!hero) {
    return (
      <ErrorState
        title="Nothing to show yet."
        description="The catalogue came back empty. Try reloading in a moment."
      />
    );
  }

  const rest = trending.filter((item) => item.tmdbId !== hero.tmdbId);

  return (
    <>
      <Hero media={hero} />
      <Section
        title="Trending this week"
        eyebrow="Right now"
        lead="The titles the most people are opening, ranked, refreshed every week."
        bleed
      >
        <TrendingRail items={rest.slice(0, 12)} label="Trending this week" />
      </Section>
    </>
  );
}

async function PopularMovies() {
  const movies = await getPopularMovies().catch(() => []);
  if (!movies.length) return null;

  /*
   * A rail, not a grid. Three rows of posters made the homepage tall enough to
   * read as a catalogue dump; one scrolling row keeps discovery horizontal and
   * cuts the images the browser has to fetch before the next section is
   * reachable.
   */
  return (
    <Section title="Popular movies" eyebrow="Film" href="/movie" tone="band" bleed>
      <PosterRail items={movies.slice(0, 18)} label="Popular movies" />
    </Section>
  );
}

async function PopularSeries() {
  const shows = await getPopularTV().catch(() => []);
  if (!shows.length) return null;

  return (
    <Section title="Popular series" eyebrow="Television" href="/tv" bleed>
      <PosterRail items={shows.slice(0, 16)} label="Popular series" />
    </Section>
  );
}

export default function HomePage() {
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
        <HeroAndTrending />
      </Suspense>

      <Suspense
        fallback={
          <SectionSkeleton bleed>
            <PosterRailSkeleton />
          </SectionSkeleton>
        }
      >
        <PopularMovies />
      </Suspense>

      <Suspense
        fallback={
          <SectionSkeleton bleed>
            <PosterRailSkeleton />
          </SectionSkeleton>
        }
      >
        <PopularSeries />
      </Suspense>

      <ContinueWatchingSection tone="band" />
      <RecentlyViewedSection />
    </>
  );
}
