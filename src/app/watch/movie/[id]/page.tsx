import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { VideoPlayer } from "@/components/VideoPlayer";
import { PlaybackRecorder } from "@/components/PlaybackRecorder";
import { Rating } from "@/components/Rating";
import { Section } from "@/components/Section";
import { MediaGrid } from "@/components/MediaGrid";
import { FavoriteButton } from "@/components/FavoriteButton";
import { GridSkeleton, SectionSkeleton } from "@/components/LoadingSkeleton";
import { runtimeLabel, year } from "@/lib/format";
import { detailsHref } from "@/lib/playback";
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
  return {
    title: `Watch ${movie.title}${released ? ` (${released})` : ""}`,
    description: movie.overview.slice(0, 180) || `Watch ${movie.title}.`,
  };
}

/* Streamed. Nothing about the player depends on it. */
async function SimilarMovies({ id }: { id: number }) {
  const similar = await getSimilar("movie", id).catch(() => []);
  if (!similar.length) return null;

  return (
    <Section title="More like this" eyebrow="Keep going" tone="band">
      <MediaGrid items={similar.slice(0, 12)} />
    </Section>
  );
}

export default async function WatchMoviePage({ params }: Props) {
  const { id } = await params;
  const parsed = parseId(id);
  if (!parsed) notFound();

  const movie = await getMovie(parsed);
  if (!movie) notFound();

  const released = year(movie.releaseDate);
  const runtime = runtimeLabel(movie.runtime);

  return (
    <>
      <PlaybackRecorder stub={toStub(movie)} />

      {/* The player is the page. Everything else is set below it and quieter. */}
      <div className="mx-auto w-full max-w-[1360px] px-4 pt-20 md:px-8 md:pt-24">
        <Link
          href={detailsHref("movie", movie.tmdbId)}
          className="group inline-flex items-center gap-2 py-4 text-sm text-fg-3 transition-colors hover:text-fg"
        >
          <ArrowLeft
            className="size-4 transition-transform duration-300 ease-out-expo group-hover:-translate-x-0.5"
            aria-hidden="true"
          />
          Back to {movie.title}
        </Link>

        <VideoPlayer
          type="movie"
          imdbId={movie.imdbId}
          tmdbId={movie.tmdbId}
          title={movie.title}
        />

        <div className="mt-10 flex flex-wrap items-start justify-between gap-6 border-t border-line pt-8">
          <div className="max-w-[64ch]">
            <span className="eyebrow">Now playing</span>
            <h1 className="display mt-2.5 text-2xl text-fg md:text-3xl">
              {movie.title}
            </h1>
            <div className="mt-3.5 flex flex-wrap items-center gap-x-3 gap-y-2">
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
              {movie.genres.length > 0 && (
                <>
                  <Dot />
                  <span className="meta">{movie.genres.join(", ")}</span>
                </>
              )}
            </div>
            {movie.overview && (
              <p className="mt-5 text-sm leading-relaxed text-fg-2">
                {movie.overview}
              </p>
            )}
          </div>

          <FavoriteButton stub={toStub(movie)} />
        </div>
      </div>

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
