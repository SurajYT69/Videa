"use client";

import { useState } from "react";
import { ArrowClockwise } from "@phosphor-icons/react";
import { playbackUrl } from "@/lib/playback";
import type { MediaType } from "@/lib/types";

type Props = {
  type: MediaType;
  /** Both ids are passed in; the provider layer decides which one to use. */
  imdbId: string | null;
  tmdbId: number;
  season?: number;
  episode?: number;
  title: string;
};

/**
 * Responsive 16:9 provider embed. The source URL is built by `lib/playback`,
 * so swapping providers does not touch this component.
 */
export function VideoPlayer({
  type,
  imdbId,
  tmdbId,
  season,
  episode,
  title,
}: Props) {
  const [attempt, setAttempt] = useState(0);
  const [loaded, setLoaded] = useState(false);

  const src =
    type === "movie"
      ? playbackUrl({ type: "movie", imdbId, tmdbId })
      : playbackUrl({
          type: "tv",
          imdbId,
          tmdbId,
          season: season ?? 1,
          episode: episode ?? 1,
        });

  return (
    <div>
      <div className="relative aspect-video w-full overflow-hidden rounded-card bg-surface ring-1 ring-line ring-inset">
        {!loaded && (
          <div className="skeleton absolute inset-0" aria-hidden="true" />
        )}
        <iframe
          key={attempt}
          src={src}
          title={`${title} player`}
          onLoad={() => setLoaded(true)}
          allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
          allowFullScreen
          referrerPolicy="origin"
          className="absolute inset-0 h-full w-full border-0"
        />
      </div>

      <button
        type="button"
        onClick={() => {
          setLoaded(false);
          setAttempt((n) => n + 1);
        }}
        className="mt-3 inline-flex items-center gap-2 text-xs text-fg-3 transition-colors hover:text-fg"
      >
        <ArrowClockwise className="size-3.5" aria-hidden="true" />
        Reload player
      </button>
    </div>
  );
}
