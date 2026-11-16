import Image from "next/image";
import Link from "next/link";
import { Play, Star } from "@phosphor-icons/react/dist/ssr";
import { BACKDROP, STILL, tmdbImage } from "@/lib/images";
import { ratingLabel, runtimeLabel } from "@/lib/format";
import { watchHref } from "@/lib/playback";
import type { Episode } from "@/lib/types";

type Props = {
  episode: Episode;
  tvId: number;
  /** True when this is where the viewer left off. */
  isResume?: boolean;
  /** Shown dimmed when the episode has no still of its own. */
  fallbackPath?: string | null;
};

/*
 * Air dates are calendar days, not instants. TMDB sends "2008-01-20", which
 * parses as UTC midnight; formatting it in the viewer's zone puts it on the
 * 19th anywhere west of Greenwich, and the server and browser would disagree.
 */
const AIR_DATE = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

function airDate(date: string | null): string | null {
  if (!date) return null;
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime()) ? null : AIR_DATE.format(parsed);
}

/**
 * A card in three typographic tiers: a mono data line (episode code, air
 * date, rating), the title in the text face, then the synopsis a step
 * smaller and quieter. The code leads because it is how a viewer finds their
 * place in a season; the title is what they read once they have.
 */
export function EpisodeCard({ episode, tvId, isResume = false, fallbackPath }: Props) {
  const still = tmdbImage(episode.stillPath, STILL.md);
  /* Older seasons often have no stills; the show's backdrop stands in, dimmed
     and labelled, so the row never reads as broken boxes. */
  const fallback = still ? null : tmdbImage(fallbackPath, BACKDROP.md);
  const src = still ?? fallback;
  const number = `E${String(episode.episodeNumber).padStart(2, "0")}`;
  const runtime = runtimeLabel(episode.runtime);
  const rating = ratingLabel(episode.rating);
  const aired = airDate(episode.airDate);

  return (
    <Link
      href={watchHref("tv", tvId, episode.seasonNumber, episode.episodeNumber)}
      className="group block rounded-card"
    >
      <div className="relative aspect-video overflow-hidden rounded-card bg-surface transition-shadow duration-300 group-hover:shadow-lift">
        {src ? (
          <Image
            src={src}
            alt=""
            fill
            /* Card width in the rail: 240px phone, 264px md up. */
            sizes="(min-width: 768px) 264px, 240px"
            className={fallback ? "object-cover opacity-35 grayscale-[40%]" : "object-cover"}
          />
        ) : null}
        {(!src || fallback) && (
          <div className="absolute inset-0 grid place-items-center">
            <span className="display text-2xl text-white/80 tabular-nums">{number}</span>
          </div>
        )}

        <span className="absolute inset-0 grid place-items-center bg-black/25 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <span className="grid size-10 place-items-center rounded-full bg-fg text-ink">
            <Play weight="fill" className="size-4 translate-x-px" aria-hidden="true" />
          </span>
        </span>

        {runtime && (
          <span className="absolute right-2 bottom-2 rounded-mini bg-black/45 px-1.5 py-0.5 backdrop-blur-md font-mono text-xs text-white tabular-nums">
            {runtime}
          </span>
        )}

        {/* The playhead: this is the episode the viewer stopped on. */}
        {isResume && (
          <span className="absolute inset-x-0 bottom-0 h-1 bg-accent" aria-hidden="true" />
        )}

        <span className="pointer-events-none absolute inset-0 rounded-card art-edge" />
      </div>

      <p className="mt-3 flex items-center gap-2 font-mono text-xs whitespace-nowrap text-fg-3 tabular-nums">
        <span className={isResume ? "font-medium text-accent" : "text-fg-2"}>
          {number}
          {isResume && <span className="sr-only">, continue here</span>}
        </span>
        {aired && (
          <>
            <span aria-hidden="true" className="size-0.5 shrink-0 rounded-full bg-fg-3" />
            <time dateTime={episode.airDate ?? undefined}>{aired}</time>
          </>
        )}
        {rating && (
          <span className="ml-auto inline-flex items-center gap-1">
            <Star weight="fill" className="size-3 text-accent" aria-hidden="true" />
            {rating}
            <span className="sr-only">out of 10</span>
          </span>
        )}
      </p>
      <h3
        className="mt-1.5 line-clamp-1 text-[15px] leading-snug font-medium text-fg"
        title={episode.name}
      >
        {episode.name}
      </h3>
      {episode.overview && (
        <p className="mt-1.5 line-clamp-3 text-[13px] leading-normal text-pretty text-fg-3">
          {episode.overview}
        </p>
      )}
    </Link>
  );
}
