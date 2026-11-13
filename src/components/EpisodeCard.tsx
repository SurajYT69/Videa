import Image from "next/image";
import Link from "next/link";
import { Play, Star } from "@phosphor-icons/react/dist/ssr";
import { STILL, tmdbImage } from "@/lib/images";
import { ratingLabel, runtimeLabel } from "@/lib/format";
import { watchHref } from "@/lib/playback";
import type { Episode } from "@/lib/types";

type Props = {
  episode: Episode;
  tvId: number;
  /** True when this is where the viewer left off. */
  isResume?: boolean;
};

/**
 * A card: the still on top with its runtime, then the title with the episode
 * number and rating on the same line, then two lines of synopsis.
 */
export function EpisodeCard({ episode, tvId, isResume = false }: Props) {
  const src = tmdbImage(episode.stillPath, STILL.md);
  const number = `E${String(episode.episodeNumber).padStart(2, "0")}`;
  const runtime = runtimeLabel(episode.runtime);
  const rating = ratingLabel(episode.rating);

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
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center">
            <span className="font-mono text-sm text-fg-3">{number}</span>
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

      <div className="mt-3 flex items-baseline justify-between gap-3">
        <h3 className="line-clamp-1 text-sm font-medium text-fg-2 transition-colors duration-200 group-hover:text-fg">
          {episode.name}
        </h3>
        <span className="flex shrink-0 items-center gap-2 font-mono text-xs tabular-nums">
          <span className={isResume ? "text-accent" : "text-fg-3"}>
            {number}
            {isResume && <span className="sr-only">, continue here</span>}
          </span>
          {rating && (
            <span className="inline-flex items-center gap-1 text-fg-3">
              <Star weight="fill" className="size-3 text-accent" aria-hidden="true" />
              {rating}
            </span>
          )}
        </span>
      </div>
      {episode.overview && (
        <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-fg-3">
          {episode.overview}
        </p>
      )}
    </Link>
  );
}
