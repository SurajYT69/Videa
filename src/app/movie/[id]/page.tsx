import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Play } from "@phosphor-icons/react/dist/ssr";
import { FactTiles, TitleHero } from "@/components/TitleHero";
import { TrailerButton } from "@/components/TrailerButton";
import { RatingsStrip } from "@/components/RatingsStrip";
import { MalPanel } from "@/components/MalPanel";
import { isAnime } from "@/lib/mal";
import { CollectionBanner } from "@/components/CollectionBanner";
import { Section } from "@/components/Section";
import { CastRail } from "@/components/CastRail";
import { MediaGrid } from "@/components/MediaGrid";
import { FavoriteButton } from "@/components/FavoriteButton";
import { ViewRecorder } from "@/components/ViewRecorder";
import { GridSkeleton, SectionSkeleton } from "@/components/LoadingSkeleton";
import { BACKDROP, tmdbImage } from "@/lib/images";
import { airDateLabel, runtimeLabel, year } from "@/lib/format";
import { watchHref } from "@/lib/playback";
import { toStub } from "@/lib/stub";
import { getMovie, getSimilar } from "@/lib/tmdb";

type Props = { params: Promise<{ id: string }> };

function parseId(raw: string): number | null {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const parsed = parseId(id);
  if (!parsed) return { title: "Title not found" };

  const movie = await getMovie(parsed).catch(() => null);
  if (!movie) return { title: "Title not found" };

  const released = year(movie.releaseDate);
  const title = released ? `${movie.title} (${released})` : movie.title;
  const description =
    movie.overview.slice(0, 180) || `Watch ${movie.title} on oovi.`;
  const image = tmdbImage(movie.backdropPath, BACKDROP.lg);

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "video.movie",
      images: image ? [{ url: image, width: 1280, height: 720 }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

/*
 * Recommendations are a second TMDB round trip and nothing above them depends
 * on it, so they stream in after the page is already usable rather than
 * holding the title, artwork and Watch button behind them.
 */
async function SimilarMovies({ id }: { id: number }) {
  const similar = await getSimilar("movie", id).catch(() => []);
  if (!similar.length) return null;

  return (
    <Section title="More like this" tone="band">
      <MediaGrid items={similar.slice(0, 12)} />
    </Section>
  );
}

export default async function MoviePage({ params }: Props) {
  const { id } = await params;
  const parsed = parseId(id);
  if (!parsed) notFound();

  const movie = await getMovie(parsed);
  if (!movie) notFound();

  const runtime = runtimeLabel(movie.runtime);
  const released = airDateLabel(movie.releaseDate);

  return (
    <>
      <ViewRecorder stub={toStub(movie)} />
      <TitleHero
        title={movie.title}
        kind="Film"
        backdropPath={movie.backdropPath}
        logoPath={movie.logoPath}
        rating={movie.rating}
        facts={[
          released,
          movie.genres.slice(0, 2).join(" & "),
          runtime,
          movie.certification,
        ]}
        tagline={movie.tagline}
        overview={movie.overview}
        providers={movie.providers}
      >
        <Link href={watchHref("movie", movie.tmdbId)} className="inline-flex items-center gap-2 rounded-full bg-fg px-7 py-4 text-base font-medium whitespace-nowrap text-ink transition duration-200 hover:-translate-y-px hover:shadow-lift active:translate-y-0 active:shadow-soft">
          <Play weight="fill" className="size-4 translate-x-px" aria-hidden="true" />
          Watch now
        </Link>
        {movie.trailerKey && (
          <TrailerButton videoKey={movie.trailerKey} title={movie.title} />
        )}
        <FavoriteButton stub={toStub(movie)} />
      </TitleHero>

      {/* The details stack: scores, then anything that streams, then the
          spec sheet. One gutter and one gap, so the rhythm under the hero
          does not depend on which of these happened to render. */}
      <div className="page flex flex-col gap-10 pt-10 md:gap-12 md:pt-14">
        <RatingsStrip imdbId={movie.imdbId} />

        {movie.collectionId && (
          <Suspense fallback={null}>
            <CollectionBanner id={movie.collectionId} />
          </Suspense>
        )}

        {isAnime(movie.genres, movie.originalLanguage) && (
          <Suspense fallback={null}>
            <MalPanel
              title={movie.title}
              originalTitle={movie.originalTitle}
              year={year(movie.releaseDate)}
              type="movie"
            />
          </Suspense>
        )}
        <FactTiles
          facts={[
            ["Genres", movie.genres.join(", ")],
            ["Release date", released],
            ["Status", movie.status],
            ["Runtime", runtime],
            ["Studios", movie.studios.join(", ")],
            ["Languages", movie.languages.join(", ")],
          ]}
        />
      </div>

      {movie.cast.length > 0 && (
        <Section title="Cast" bleed>
          <CastRail cast={movie.cast} />
        </Section>
      )}

      <Suspense
        fallback={
          <SectionSkeleton>
            <GridSkeleton count={6} />
          </SectionSkeleton>
        }
      >
        <SimilarMovies id={parsed} />
      </Suspense>
    </>
  );
}
