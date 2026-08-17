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

export default async function MoviePage({ params }: Props) {
  const { id } = await params;
  const parsed = parseId(id);
  if (!parsed) notFound();

  const movie = await getMovie(parsed);
  if (!movie) notFound();

  const similar = await getSimilar("movie", parsed).catch(() => []);
  const released = year(movie.releaseDate);

  return (
    <>
      <ViewRecorder stub={toStub(movie)} />
      <DetailBackdrop path={movie.backdropPath} />

      <div className="page -mt-28 md:-mt-40">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-12 md:gap-10">
          <div className="hidden md:col-span-3 md:block lg:col-span-3 xl:col-span-2">
            <div className="relative aspect-2/3 overflow-hidden rounded-card bg-surface shadow-lift">
              <Poster
                path={movie.posterPath}
                title={movie.title}
                sizes="(min-width: 1280px) 200px, 260px"
                size="lg"
                priority
              />
              <div className="pointer-events-none absolute inset-0 rounded-card art-edge" />
            </div>
          </div>

          <div className="md:col-span-9 md:pt-16 lg:col-span-8">
            <h1 className="display text-4xl text-fg text-balance md:text-5xl lg:text-6xl">
              {movie.title}
            </h1>

            <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
              <Rating value={movie.rating} />
              {released && <span className="meta">{released}</span>}
              {runtimeLabel(movie.runtime) && (
                <span className="meta">{runtimeLabel(movie.runtime)}</span>
              )}
              {movie.certification && (
                <span className="rounded-card border border-line-strong px-1.5 py-0.5 font-mono text-[10px] text-fg-2">
                  {movie.certification}
                </span>
              )}
            </div>

            {movie.genres.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2">
                {movie.genres.map((genre) => (
                  <GenreBadge key={genre} label={genre} />
                ))}
              </div>
            )}

            {movie.tagline && (
              <p className="mt-7 max-w-[52ch] text-sm text-fg-3 italic">
                {movie.tagline}
              </p>
            )}

            {movie.overview && (
              <p className="mt-4 max-w-[62ch] text-sm leading-relaxed text-fg-2 md:text-base">
                {movie.overview}
              </p>
            )}

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link
                href={watchHref("movie", movie.tmdbId)}
                className="inline-flex items-center gap-2.5 rounded-card bg-fg px-8 py-4 text-base font-medium whitespace-nowrap text-ink transition duration-200 hover:-translate-y-px hover:shadow-lift active:translate-y-0 active:shadow-soft"
              >
                <Play weight="fill" className="size-4" aria-hidden="true" />
                Watch now
              </Link>
              <FavoriteButton stub={toStub(movie)} />
            </div>
          </div>
        </div>
      </div>

      {movie.cast.length > 0 && (
        <Section title="Cast" bleed>
          <CastRail cast={movie.cast} />
        </Section>
      )}

      {similar.length > 0 && (
        <Section title="More like this">
          <MediaGrid items={similar.slice(0, 12)} />
        </Section>
      )}
    </>
  );
}
