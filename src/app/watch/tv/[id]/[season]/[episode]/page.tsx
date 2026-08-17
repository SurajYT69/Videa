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

  /* The season request does not depend on the show request: both keys are
     already in the URL. Running them together saves a full round trip before
     the player can mount. */
  const [show, seasonData] = await Promise.all([
    getTV(tvId),
    getSeason(tvId, seasonNumber),
  ]);
  if (!show || !seasonData) notFound();

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
  const runtime = runtimeLabel(current.runtime);
  const aired = airDateLabel(current.airDate);

  return (
    <>
      <PlaybackRecorder
        stub={toStub(show)}
        season={seasonNumber}
        episode={episodeNumber}
      />

      <div className="mx-auto w-full max-w-[1360px] px-4 pt-20 md:px-8 md:pt-24">
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

        <VideoPlayer
          type="tv"
          imdbId={show.imdbId}
          tmdbId={show.tmdbId}
          season={seasonNumber}
          episode={episodeNumber}
          title={`${show.title} ${code}`}
        />

        <div className="mt-10 border-t border-line pt-8">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="max-w-[64ch]">
              <p className="eyebrow">
                {show.title}
                <span className="mx-2 text-fg-3/50" aria-hidden="true">
                  /
                </span>
                <span className="text-accent">{code}</span>
              </p>
              <h1 className="display mt-2.5 text-2xl text-fg md:text-3xl">
                {current.name}
              </h1>
              <div className="mt-3.5 flex flex-wrap items-center gap-x-3 gap-y-2">
                <Rating value={current.rating} />
                {runtime && (
                  <>
                    <Dot />
                    <span className="meta">{runtime}</span>
                  </>
                )}
                {aired && (
                  <>
                    <Dot />
                    <span className="meta">{aired}</span>
                  </>
                )}
              </div>
            </div>

            <FavoriteButton stub={toStub(show)} />
          </div>

          {current.overview && (
            <p className="mt-6 max-w-[64ch] text-sm leading-relaxed text-fg-2">
              {current.overview}
            </p>
          )}

          {(previous || next) && (
            <nav
              aria-label="Episode navigation"
              className="mt-9 grid gap-3 sm:grid-cols-2"
            >
              {previous ? (
                <EpisodeStep
                  href={watchHref("tv", show.tmdbId, previous.season, previous.episode)}
                  direction="previous"
                  code={episodeCode(previous.season, previous.episode)}
                />
              ) : (
                <span />
              )}
              {next && (
                <EpisodeStep
                  href={watchHref("tv", show.tmdbId, next.season, next.episode)}
                  direction="next"
                  code={episodeCode(next.season, next.episode)}
                />
              )}
            </nav>
          )}
        </div>
      </div>
    </>
  );
}

function EpisodeStep({
  href,
  direction,
  code,
}: {
  href: string;
  direction: "previous" | "next";
  code: string;
}) {
  const isNext = direction === "next";
  return (
    <Link
      href={href}
      className={`group flex items-center gap-3 rounded-card border border-line-strong px-5 py-4 transition duration-200 hover:border-fg-3 hover:bg-raised active:translate-y-px ${
        isNext ? "sm:flex-row-reverse sm:text-right" : ""
      }`}
    >
      {isNext ? (
        <CaretRight
          className="size-4 shrink-0 text-fg-3 transition-transform duration-300 ease-out-expo group-hover:translate-x-0.5"
          aria-hidden="true"
        />
      ) : (
        <CaretLeft
          className="size-4 shrink-0 text-fg-3 transition-transform duration-300 ease-out-expo group-hover:-translate-x-0.5"
          aria-hidden="true"
        />
      )}
      <span className="min-w-0">
        <span className="eyebrow block">
          {isNext ? "Next episode" : "Previous episode"}
        </span>
        <span className="mt-1 block font-mono text-sm text-fg">{code}</span>
      </span>
    </Link>
  );
}

function Dot() {
  return (
    <span aria-hidden="true" className="size-[3px] rounded-full bg-fg-3/50" />
  );
}
