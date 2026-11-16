import { Suspense } from "react";
import Link from "next/link";
import { TONIGHT_MOODS } from "@/lib/tmdb-options";
import { Hero } from "@/components/Hero";
import { heroThumb } from "@/lib/heroThumb";
import { HeroCarousel } from "@/components/HeroCarousel";
import { DiscoverRail } from "@/components/DiscoverRail";
import { NewEpisodes } from "@/components/NewEpisodes";
import { Section } from "@/components/Section";
import { PosterRail } from "@/components/PosterRail";
import { Top10Rail } from "@/components/Top10Rail";
import {
  ContinueWatchingSection,
  RecentlyViewedSection,
} from "@/components/LibrarySections";
import { ErrorState } from "@/components/ErrorState";
import {
  HeroSkeleton,
  PosterRailSkeleton,
  SectionSkeleton,
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
        title="We can't reach the catalogue"
        description="The metadata service is not responding. Try reloading in a moment."
      />
    );
  }

  /* The hero needs artwork wide enough to hold a composition. */
  const hero = trending.find((item) => item.backdropPath) ?? trending[0];
  if (!hero) {
    return (
      <ErrorState
        title="Nothing to show yet"
        description="The catalogue came back empty. Try reloading in a moment."
      />
    );
  }

  /* Five titles with artwork wide enough to hold the hero composition. */
  const heroes = trending.filter((item) => item.backdropPath).slice(0, 5);
  const heroIds = new Set(heroes.map((item) => item.tmdbId));
  const rest = trending.filter((item) => !heroIds.has(item.tmdbId));

  return (
    <>
      <HeroCarousel
        thumbs={(heroes.length ? heroes : [hero]).map(heroThumb)}
        slides={(heroes.length ? heroes : [hero]).map((item, index) => (
          <Hero key={item.tmdbId} media={item} priority={index === 0} />
        ))}
      />
      <NewEpisodes />
      <Section
        title="Trending this week"
        badge="Top 10"
        bleed
      >
        <Top10Rail items={rest} label="Trending this week" />
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
    <Section title="Popular movies" href="/movie" tone="band" bleed>
      <PosterRail items={movies.slice(0, 18)} label="Popular movies" />
    </Section>
  );
}

async function PopularSeries() {
  const shows = await getPopularTV().catch(() => []);
  if (!shows.length) return null;

  return (
    <Section title="Popular series" href="/tv" bleed>
      <PosterRail items={shows.slice(0, 16)} label="Popular series" />
    </Section>
  );
}

/* The first of /tonight's three taps, taken here. Also the phone's way in:
   the tab capsule has no room for a sixth destination. */
function TonightTeaser() {
  return (
    <Section
      title="Can't decide tonight?"
      lead="Pick a mood, say how long you have, and get five picks."
      href="/tonight"
      hrefLabel="Open picker"
      tone="band"
    >
      <ul className="flex flex-wrap gap-2">
        {TONIGHT_MOODS.map((mood) => (
          <li key={mood.id}>
            <Link
              href={`/tonight?mood=${mood.id}`}
              className="glass inline-flex h-11 items-center rounded-full px-5 text-sm font-medium whitespace-nowrap text-fg-2 transition-colors duration-200 hover:text-fg"
            >
              {mood.label}
            </Link>
          </li>
        ))}
      </ul>
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
              <PosterRailSkeleton />
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

      <TonightTeaser />

      {/* Indian cinema and television: the audience this site is used by most.
          The first rail leads to /india, which has the new and upcoming. */}
      <DiscoverRail
        title="Popular Hindi films"
        type="movie"
        params={{ language: "hi", minVotes: 50 }}
        href="/india"
      />
      <DiscoverRail
        title="Hindi series"
        type="tv"
        params={{ language: "hi", minVotes: 10 }}
        tone="band"
      />
      <DiscoverRail title="Telugu films" type="movie" params={{ language: "te", minVotes: 30 }} />
      <DiscoverRail
        title="Tamil films"
        type="movie"
        params={{ language: "ta", minVotes: 30 }}
        tone="band"
      />

      <ContinueWatchingSection />
      <RecentlyViewedSection tone="band" />
    </>
  );
}
