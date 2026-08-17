import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Play } from "@phosphor-icons/react/dist/ssr";
import { DetailBackdrop } from "@/components/DetailBackdrop";
import { Poster } from "@/components/Poster";
import { Rating } from "@/components/Rating";
import { GenreBadge } from "@/components/GenreBadge";
import { Section } from "@/components/Section";
import { CastRail } from "@/components/CastRail";
import { MediaGrid } from "@/components/MediaGrid";
import { FavoriteButton } from "@/components/FavoriteButton";
import { ViewRecorder } from "@/components/ViewRecorder";
import { GridSkeleton, SectionSkeleton } from "@/components/LoadingSkeleton";
import { BACKDROP, tmdbImage } from "@/lib/images";
import { runtimeLabel, year } from "@/lib/format";
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
    movie.overview.slice(0, 180) || `Watch ${movie.title} on Videa.`;
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
    <Section title="More like this" eyebrow="Keep going" tone="band">
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

  const released = year(movie.releaseDate);
  const runtime = runtimeLabel(movie.runtime);

  return (
    <>
      <ViewRecorder stub={toStub(movie)} />
      <DetailBackdrop path={movie.backdropPath} />

      <div className="page -mt-28 pb-4 md:-mt-40">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-12 md:gap-12">
          <div className="hidden md:col-span-4 md:block lg:col-span-3">
            <div className="relative aspect-2/3 overflow-hidden rounded-card bg-surface shadow-lift">
              <Poster
                path={movie.posterPath}
                title={movie.title}
                sizes="(min-width: 1280px) 320px, 280px"
                size="lg"
                priority
              />
              <div className="pointer-events-none absolute inset-0 rounded-card art-edge" />
            </div>
          </div>

          <div className="md:col-span-8 md:pt-20 lg:col-span-8 lg:pt-24">
            <div className="flex items-center gap-3">
              <span className="h-px w-8 bg-fg-3/50" />
              <span className="eyebrow">Film</span>
            </div>

            <h1 className="display display-page mt-5 max-w-[18ch] text-fg text-balance">
              {movie.title}
            </h1>

            {movie.tagline && (
              <p className="mt-4 max-w-[52ch] text-base text-fg-3 italic">
                {movie.tagline}
              </p>
            )}

            <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2">
              <Rating value={movie.rating} />
              {released && (
                <>
                  <Dot />
                  <span className="meta">{released}</span>
                </>
              )}
              {runtime && (
                <>
                  <Dot />
                  <span className="meta">{runtime}</span>
                </>
              )}
              {movie.certification && (
                <>
                  <Dot />
                  <span className="rounded-mini border border-line-strong px-1.5 py-0.5 font-mono text-[10px] text-fg-2">
                    {movie.certification}
                  </span>
                </>
              )}
            </div>

            {movie.genres.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2">
                {movie.genres.map((genre) => (
                  <GenreBadge key={genre} label={genre} />
                ))}
              </div>
            )}

            {movie.overview && (
              <p className="mt-7 max-w-[64ch] text-[15px] leading-relaxed text-fg-2 md:text-base">
                {movie.overview}
              </p>
            )}

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link
                href={watchHref("movie", movie.tmdbId)}
                className="inline-flex items-center gap-2.5 rounded-card bg-fg px-8 py-4 text-base font-medium whitespace-nowrap text-ink transition duration-200 hover:-translate-y-px hover:shadow-lift active:translate-y-0 active:shadow-soft"
              >
                <Play weight="fill" className="size-4 translate-x-px" aria-hidden="true" />
                Watch now
              </Link>
              <FavoriteButton stub={toStub(movie)} />
            </div>
          </div>
        </div>
      </div>

      {movie.cast.length > 0 && (
        <Section title="Cast" eyebrow="Who's in it" bleed>
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

function Dot() {
  return (
    <span aria-hidden="true" className="size-[3px] rounded-full bg-fg-3/50" />
  );
}
