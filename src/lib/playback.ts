/**
 * Playback source resolution.
 *
 * The provider is isolated here so it can be swapped without touching any
 * page or component. Callers pass intent (what to play), never a URL.
 */

import type { MediaType } from "./types";

const PROVIDER = {
  name: "VidFast",
  base: "https://vidfast.vc",
  /** Origins accepted for player postMessage events. */
  trustedOrigins: ["https://vidfast.vc", "https://vidfast.pro"],
} as const;

export const PLAYER_ORIGINS: readonly string[] = PROVIDER.trustedOrigins;

export type PlaybackRequest =
  | { type: "movie"; imdbId: string | null; tmdbId: number }
  | {
      type: "tv";
      imdbId: string | null;
      tmdbId: number;
      season: number;
      episode: number;
    };

/**
 * IMDb is preferred when available; TMDB is the fallback. Both are valid
 * identifiers for the provider, so a missing IMDb id degrades silently.
 */
export function playbackId(req: {
  imdbId: string | null;
  tmdbId: number;
}): string {
  return req.imdbId ?? String(req.tmdbId);
}

export function playbackUrl(req: PlaybackRequest): string {
  const id = playbackId(req);
  if (req.type === "movie") {
    return `${PROVIDER.base}/movie/${id}`;
  }
  return `${PROVIDER.base}/tv/${id}/${req.season}/${req.episode}`;
}

export function watchHref(
  type: MediaType,
  tmdbId: number,
  season?: number,
  episode?: number,
): string {
  if (type === "movie") return `/watch/movie/${tmdbId}`;
  return `/watch/tv/${tmdbId}/${season ?? 1}/${episode ?? 1}`;
}

export function detailsHref(type: MediaType, tmdbId: number): string {
  return `/${type}/${tmdbId}`;
}
