/**
 * Playback source resolution.
 *
 * Every provider lives in `SERVERS` below and nowhere else. Callers pass intent
 * (what to play) and, optionally, which server; they never build a URL.
 */

import type { MediaType } from "./types";

export type PlaybackRequest =
  | { type: "movie"; imdbId: string | null; tmdbId: number }
  | {
      type: "tv";
      imdbId: string | null;
      tmdbId: number;
      season: number;
      episode: number;
    };

export type Server = {
  /** Stable key; also what the switcher remembers. */
  id: string;
  /** Shown on the switcher. */
  name: string;
  /** Origins accepted for this player's postMessage progress events. */
  trustedOrigins: readonly string[];
  url: (req: PlaybackRequest) => string;
};

/*
 * The switcher lists these in order and the first one is the default.
 *
 * To add a server, add one entry: an id, a name, the origins its player posts
 * progress from, and how it builds a movie and an episode URL from the ids.
 * The switcher appears on the watch pages as soon as there are two.
 */
export const SERVERS: readonly Server[] = [
  {
    id: "vidfast",
    name: "VidFast",
    trustedOrigins: ["https://vidfast.vc", "https://vidfast.pro"],
    url: (req) => {
      const id = playbackId(req);
      return req.type === "movie"
        ? `https://vidfast.vc/movie/${id}`
        : `https://vidfast.vc/tv/${id}/${req.season}/${req.episode}`;
    },
  },
  {
    id: "vidlink",
    name: "VidLink",
    trustedOrigins: ["https://vidlink.pro"],
    url: (req) => {
      const id = String(req.tmdbId);
      return req.type === "movie"
        ? `https://vidlink.pro/movie/${id}`
        : `https://vidlink.pro/tv/${id}/${req.season}/${req.episode}`;
    },
  },
  {
    id: "vidsrc",
    name: "VidSrc",
    trustedOrigins: ["https://vidsrc.mov"], 
    url: (req) => {
      const id = playbackId(req);
      return req.type === "movie"
        ? `https://vidsrc.mov/embed/movie/${id}`
        : `https://vidsrc.mov/embed/tv/${id}/${req.season}/${req.episode}`;
    },
  },
];

export const PLAYER_ORIGINS: readonly string[] = SERVERS.flatMap(
  (server) => server.trustedOrigins,
);

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

/** Unknown or missing server ids fall back to the first server. */
export function playbackUrl(req: PlaybackRequest, serverId?: string): string {
  const server = SERVERS.find((s) => s.id === serverId) ?? SERVERS[0]!;
  return server.url(req);
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
