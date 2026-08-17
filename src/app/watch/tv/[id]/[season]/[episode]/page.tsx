import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CaretLeft,
  CaretRight,
} from "@phosphor-icons/react/dist/ssr";
import { VideoPlayer } from "@/components/VideoPlayer";
import { PlaybackRecorder } from "@/components/PlaybackRecorder";
import { Rating } from "@/components/Rating";
import { FavoriteButton } from "@/components/FavoriteButton";
import { airDateLabel, episodeCode, runtimeLabel } from "@/lib/format";
import { detailsHref, watchHref } from "@/lib/playback";
import { toStub } from "@/lib/stub";
import { getSeason, getTV } from "@/lib/tmdb";
import type { SeasonSummary } from "@/lib/types";

type Props = {
  params: Promise<{ id: string; season: string; episode: string }>;
};

function parseInt10(raw: string): number | null {
  const value = Number(raw);
  return Number.isInteger(value) && value > 0 ? value : null;
}

type Step = { season: number; episode: number } | null;

/** Walks across season boundaries so the last episode links into the next season. */
function neighbours(
  seasons: SeasonSummary[],
  season: number,
  episode: number,
): { previous: Step; next: Step } {
  const index = seasons.findIndex((s) => s.seasonNumber === season);
  const current = seasons[index];
  if (!current) return { previous: null, next: null };

  const before = index > 0 ? seasons[index - 1] : undefined;
  const after = seasons[index + 1];

  const previous: Step =
    episode > 1
      ? { season, episode: episode - 1 }
      : before
        ? { season: before.seasonNumber, episode: before.episodeCount }
        : null;

  const next: Step =
    episode < current.episodeCount
      ? { season, episode: episode + 1 }
      : after
        ? { season: after.seasonNumber, episode: 1 }
        : null;

  return { previous, next };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id, season, episode } = await params;
  const tvId = parseInt10(id);
  const seasonNumber = parseInt10(season);
  const episodeNumber = parseInt10(episode);
  if (!tvId || !seasonNumber || !episodeNumber) {
    return { title: "Episode not found" };
  }

  const show = await getTV(tvId).catch(() => null);
  if (!show) return { title: "Episode not found" };

  const code = episodeCode(seasonNumber, episodeNumber);
  return {
    title: `${show.title} ${code}`,
    description: `Watch ${show.title} ${code}.`,
  };
}

export default async function WatchEpisodePage({ params }: Props) {
  const { id, season, episode } = await params;
  const tvId = parseInt10(id);
  const seasonNumber = parseInt10(season);
  const episodeNumber = parseInt10(episode);
  if (!tvId || !seasonNumber || !episodeNumber) notFound();

  const show = await getTV(tvId);
  if (!show) notFound();

  const seasonData = await getSeason(tvId, seasonNumber);
  if (!seasonData) notFound();

  const current = seasonData.episodes.find(
    (item) => item.episodeNumber === episodeNumber,
  );
  if (!current) notFound();

  const { previous, next } = neighbours(
    show.seasons,
    seasonNumber,
    episodeNumber,
  );
  const code = episodeCode(seasonNumber, episodeNumber);

  return (
    <>
      <PlaybackRecorder
        stub={toStub(show)}
        season={seasonNumber}
        episode={episodeNumber}
      />

      <div className="page pt-20 md:pt-24">
        <Link
          href={detailsHref("tv", show.tmdbId)}
          className="group inline-flex items-center gap-2 py-4 text-sm text-fg-3 transition-colors hover:text-fg"
        >
          <ArrowLeft
            className="size-4 transition-transform duration-300 ease-out-expo group-hover:-translate-x-0.5"
            aria-hidden="true"
          />
          Back to {show.title}
        </Link>

        <div className="mt-2">
          <VideoPlayer
            type="tv"
            imdbId={show.imdbId}
            tmdbId={show.tmdbId}
            season={seasonNumber}
            episode={episodeNumber}
            title={`${show.title} ${code}`}
          />
        </div>

        <div className="mt-10 border-t border-line pt-8">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="max-w-[62ch]">
              <p className="meta">
                {show.title}
                {"  ·  "}
                <span className="text-accent">{code}</span>
              </p>
              <h1 className="display mt-2 text-2xl text-fg md:text-3xl">
                {current.name}
              </h1>
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
                <Rating value={current.rating} />
                {runtimeLabel(current.runtime) && (
                  <span className="meta">{runtimeLabel(current.runtime)}</span>
                )}
                {airDateLabel(current.airDate) && (
                  <span className="meta">{airDateLabel(current.airDate)}</span>
                )}
              </div>
            </div>

            <FavoriteButton stub={toStub(show)} />
          </div>

          {(previous || next) && (
            <nav
              aria-label="Episode navigation"
              className="mt-8 flex flex-wrap gap-3"
            >
              {previous && (
                <Link
                  href={watchHref(
                    "tv",
                    show.tmdbId,
                    previous.season,
                    previous.episode,
                  )}
                  className="inline-flex items-center gap-2 rounded-card border border-line-strong px-4 py-2.5 text-sm whitespace-nowrap text-fg-2 transition duration-200 hover:border-fg-3 hover:bg-raised hover:text-fg active:translate-y-px"
                >
                  <CaretLeft className="size-3.5" aria-hidden="true" />
                  Previous
                  <span className="font-mono text-[11px] text-fg-3">
                    {episodeCode(previous.season, previous.episode)}
                  </span>
                </Link>
              )}
              {next && (
                <Link
                  href={watchHref("tv", show.tmdbId, next.season, next.episode)}
                  className="inline-flex items-center gap-2 rounded-card border border-line-strong px-4 py-2.5 text-sm whitespace-nowrap text-fg-2 transition duration-200 hover:border-fg-3 hover:bg-raised hover:text-fg active:translate-y-px"
                >
                  Next
                  <span className="font-mono text-[11px] text-fg-3">
                    {episodeCode(next.season, next.episode)}
                  </span>
                  <CaretRight className="size-3.5" aria-hidden="true" />
                </Link>
              )}
            </nav>
          )}

          {current.overview && (
            <p className="mt-8 max-w-[62ch] text-sm leading-relaxed text-fg-2">
              {current.overview}
            </p>
          )}
        </div>
      </div>
    </>
  );
}
