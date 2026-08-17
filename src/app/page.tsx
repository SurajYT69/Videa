import { Hero } from "@/components/Hero";
import { Section } from "@/components/Section";
import { MediaGrid } from "@/components/MediaGrid";
import { PosterRail } from "@/components/PosterRail";
import { TrendingRail } from "@/components/TrendingRail";
import {
  ContinueWatchingSection,
  RecentlyViewedSection,
} from "@/components/LibrarySections";
import { ErrorState } from "@/components/ErrorState";
import {
  ConfigError,
  getPopularMovies,
  getPopularTV,
  getTrending,
} from "@/lib/tmdb";

export default async function HomePage() {
  let trending, movies, shows;

  try {
    [trending, movies, shows] = await Promise.all([
      getTrending(),
      getPopularMovies(),
      getPopularTV(),
    ]);
  } catch (error) {
    /* A misconfigured key must fail loudly rather than cache an error page. */
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
  const rest = hero
    ? trending.filter((item) => item.tmdbId !== hero.tmdbId)
    : trending;

  if (!hero) {
    return (
      <ErrorState
        title="Nothing to show yet."
        description="The catalogue came back empty. Try reloading in a moment."
      />
    );
  }

  return (
    <>
      <Hero media={hero} />

      <Section title="Trending this week" bleed>
        <TrendingRail items={rest.slice(0, 14)} />
      </Section>

      <Section title="Popular movies" href="/movie">
        <MediaGrid items={movies.slice(0, 18)} />
      </Section>

      <Section title="Popular series" href="/tv" bleed>
        <PosterRail items={shows.slice(0, 16)} />
      </Section>

      <ContinueWatchingSection />
      <RecentlyViewedSection />
    </>
  );
}
