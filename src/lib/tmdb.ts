/**
 * TMDB access layer. Server-only.
 *
 * Every function here returns normalized application types. Raw TMDB payload
 * shapes must not escape this file.
 */

import type {
  CastMember,
  Episode,
  MediaItem,
  MediaType,
  MovieDetails,
  Season,
  SeasonSummary,
  TVDetails,
} from "./types";

const BASE = "https://api.themoviedb.org/3";

export class TmdbError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "TmdbError";
  }
}

/**
 * A missing key is a deployment mistake, not a runtime outage. It is thrown as
 * its own type so pages rethrow it instead of quietly rendering an error state
 * that would then be cached.
 */
export class ConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConfigError";
  }
}

function apiKey(): string {
  const key = process.env.TMDB_API_KEY;
  if (!key) {
    throw new ConfigError(
      "TMDB_API_KEY is not set. Copy .env.example to .env.local and add your key.",
    );
  }
  return key;
}

type Params = Record<string, string | number | boolean | undefined>;

async function tmdb<T>(
  path: string,
  params: Params = {},
  revalidate = 60 * 60,
): Promise<T> {
  const url = new URL(BASE + path);
  url.searchParams.set("api_key", apiKey());
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== "") url.searchParams.set(k, String(v));
  }

  let res: Response;
  try {
    res = await fetch(url, { next: { revalidate } });
  } catch {
    throw new TmdbError("Could not reach TMDB.", 503);
  }

  if (!res.ok) {
    throw new TmdbError(`TMDB request failed for ${path}`, res.status);
  }
  return (await res.json()) as T;
}

/** Resolves to null on 404 so callers can render a not-found state. */
async function tmdbOrNull<T>(
  path: string,
  params?: Params,
  revalidate?: number,
): Promise<T | null> {
  try {
    return await tmdb<T>(path, params, revalidate);
  } catch (err) {
    if (err instanceof TmdbError && err.status === 404) return null;
    throw err;
  }
}

/* -------------------------------------------------------------------------
   Raw shapes (local to this module)
   ------------------------------------------------------------------------- */

type RawGenre = { id: number; name: string };

type RawMedia = {
  id: number;
  media_type?: string;
  title?: string;
  name?: string;
  original_title?: string;
  original_name?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  overview?: string;
  release_date?: string;
  first_air_date?: string;
  vote_average?: number;
  genre_ids?: number[];
  genres?: RawGenre[];
  popularity?: number;
};

type RawPage = { results?: RawMedia[]; total_results?: number };

type RawCredits = {
  cast?: Array<{
    id: number;
    name: string;
    character?: string;
    profile_path?: string | null;
  }>;
  crew?: Array<{ id: number; name: string; job?: string }>;
};

/* -------------------------------------------------------------------------
   Genre resolution — search results carry ids, not names.
   ------------------------------------------------------------------------- */

async function genreMap(type: MediaType): Promise<Map<number, string>> {
  const data = await tmdb<{ genres?: RawGenre[] }>(
    `/genre/${type}/list`,
    {},
    60 * 60 * 24 * 7,
  );
  return new Map((data.genres ?? []).map((g) => [g.id, g.name]));
}

/* -------------------------------------------------------------------------
   Normalizers
   ------------------------------------------------------------------------- */

function inferType(raw: RawMedia, fallback?: MediaType): MediaType | null {
  if (raw.media_type === "movie" || raw.media_type === "tv") {
    return raw.media_type;
  }
  if (fallback) return fallback;
  if (raw.title || raw.release_date) return "movie";
  if (raw.name || raw.first_air_date) return "tv";
  return null;
}

function normalize(
  raw: RawMedia,
  type: MediaType,
  genres: Map<number, string>,
): MediaItem {
  const names = raw.genres
    ? raw.genres.map((g) => g.name)
    : (raw.genre_ids ?? [])
        .map((id) => genres.get(id))
        .filter((n): n is string => Boolean(n));

  return {
    tmdbId: raw.id,
    imdbId: null,
    type,
    title: raw.title ?? raw.name ?? "Untitled",
    originalTitle: raw.original_title ?? raw.original_name,
    posterPath: raw.poster_path ?? null,
    backdropPath: raw.backdrop_path ?? null,
    overview: raw.overview ?? "",
    releaseDate: raw.release_date || raw.first_air_date || null,
    rating: Math.round((raw.vote_average ?? 0) * 10) / 10,
    genres: names.slice(0, 3),
  };
}

/**
 * Normalizes a mixed page of results. Anything that isn't a movie or show
 * (people, collections) is dropped rather than rendered as a broken card.
 */
async function normalizePage(
  page: RawPage,
  fallback?: MediaType,
): Promise<MediaItem[]> {
  const raws = page.results ?? [];
  const needsMovie = raws.some((r) => inferType(r, fallback) === "movie");
  const needsTv = raws.some((r) => inferType(r, fallback) === "tv");

  const [movieGenres, tvGenres] = await Promise.all([
    needsMovie ? genreMap("movie") : Promise.resolve(new Map<number, string>()),
    needsTv ? genreMap("tv") : Promise.resolve(new Map<number, string>()),
  ]);

  const out: MediaItem[] = [];
  for (const raw of raws) {
    const type = inferType(raw, fallback);
    if (!type) continue;
    out.push(normalize(raw, type, type === "movie" ? movieGenres : tvGenres));
  }
  return out;
}

function normalizeCast(credits: RawCredits | undefined): CastMember[] {
  return (credits?.cast ?? []).slice(0, 12).map((c) => ({
    id: c.id,
    name: c.name,
    character: c.character ?? "",
    profilePath: c.profile_path ?? null,
  }));
}

/* -------------------------------------------------------------------------
   Search
   ------------------------------------------------------------------------- */

export async function searchMulti(query: string): Promise<MediaItem[]> {
  if (!query.trim()) return [];
  const page = await tmdb<RawPage>(
    "/search/multi",
    { query, include_adult: false },
    60 * 5,
  );
  return normalizePage(page);
}

export async function searchMovies(query: string): Promise<MediaItem[]> {
  if (!query.trim()) return [];
  const page = await tmdb<RawPage>(
    "/search/movie",
    { query, include_adult: false },
    60 * 5,
  );
  return normalizePage(page, "movie");
}

export async function searchTV(query: string): Promise<MediaItem[]> {
  if (!query.trim()) return [];
  const page = await tmdb<RawPage>(
    "/search/tv",
    { query, include_adult: false },
    60 * 5,
  );
  return normalizePage(page, "tv");
}

/* -------------------------------------------------------------------------
   Details
   ------------------------------------------------------------------------- */

export async function getMovie(id: number): Promise<MovieDetails | null> {
  type Raw = RawMedia & {
    runtime?: number | null;
    tagline?: string | null;
    imdb_id?: string | null;
    credits?: RawCredits;
    release_dates?: {
      results?: Array<{
        iso_3166_1: string;
        release_dates?: Array<{ certification?: string }>;
      }>;
    };
  };

  const raw = await tmdbOrNull<Raw>(`/movie/${id}`, {
    append_to_response: "credits,release_dates",
  });
  if (!raw) return null;

  const base = normalize(raw, "movie", new Map());
  const us = raw.release_dates?.results?.find((r) => r.iso_3166_1 === "US");
  const cert = us?.release_dates?.find((d) => d.certification)?.certification;

  return {
    ...base,
    type: "movie",
    imdbId: raw.imdb_id || null,
    runtime: raw.runtime || null,
    tagline: raw.tagline || null,
    cast: normalizeCast(raw.credits),
    certification: cert || null,
  };
}

export async function getTV(id: number): Promise<TVDetails | null> {
  type Raw = RawMedia & {
    seasons?: Array<{
      season_number: number;
      name?: string;
      episode_count?: number;
      air_date?: string | null;
      poster_path?: string | null;
    }>;
    created_by?: Array<{ name: string }>;
    episode_run_time?: number[];
    status?: string;
    last_air_date?: string | null;
    credits?: RawCredits;
    external_ids?: { imdb_id?: string | null };
  };

  const raw = await tmdbOrNull<Raw>(`/tv/${id}`, {
    append_to_response: "credits,external_ids",
  });
  if (!raw) return null;

  const base = normalize(raw, "tv", new Map());

  /* Season 0 is "Specials". Kept out of the default browse path. */
  const seasons: SeasonSummary[] = (raw.seasons ?? [])
    .filter((s) => s.season_number > 0 && (s.episode_count ?? 0) > 0)
    .map((s) => ({
      seasonNumber: s.season_number,
      name: s.name ?? `Season ${s.season_number}`,
      episodeCount: s.episode_count ?? 0,
      airDate: s.air_date ?? null,
      posterPath: s.poster_path ?? null,
    }));

  return {
    ...base,
    type: "tv",
    imdbId: raw.external_ids?.imdb_id || null,
    seasons,
    creators: (raw.created_by ?? []).map((c) => c.name).slice(0, 3),
    cast: normalizeCast(raw.credits),
    episodeRunTime: raw.episode_run_time?.[0] ?? null,
    status: raw.status ?? null,
    lastAirDate: raw.last_air_date ?? null,
  };
}

/* -------------------------------------------------------------------------
   External IDs — IMDb resolution
   ------------------------------------------------------------------------- */

export async function getMovieExternalIds(id: number): Promise<string | null> {
  const raw = await tmdbOrNull<{ imdb_id?: string | null }>(
    `/movie/${id}/external_ids`,
  );
  return raw?.imdb_id || null;
}

export async function getTVExternalIds(id: number): Promise<string | null> {
  const raw = await tmdbOrNull<{ imdb_id?: string | null }>(
    `/tv/${id}/external_ids`,
  );
  return raw?.imdb_id || null;
}

/* -------------------------------------------------------------------------
   Seasons — fetched only when a season is actually opened.
   ------------------------------------------------------------------------- */

export async function getSeason(
  tvId: number,
  seasonNumber: number,
): Promise<Season | null> {
  type Raw = {
    season_number: number;
    name?: string;
    overview?: string;
    episodes?: Array<{
      season_number?: number;
      episode_number: number;
      name?: string;
      overview?: string;
      still_path?: string | null;
      air_date?: string | null;
      runtime?: number | null;
      vote_average?: number;
    }>;
  };

  const raw = await tmdbOrNull<Raw>(`/tv/${tvId}/season/${seasonNumber}`);
  if (!raw) return null;

  return {
    seasonNumber: raw.season_number,
    name: raw.name ?? `Season ${seasonNumber}`,
    overview: raw.overview ?? "",
    episodes: (raw.episodes ?? []).map(
      (e): Episode => ({
        seasonNumber: e.season_number ?? seasonNumber,
        episodeNumber: e.episode_number,
        name: e.name ?? `Episode ${e.episode_number}`,
        overview: e.overview ?? "",
        stillPath: e.still_path ?? null,
        airDate: e.air_date ?? null,
        runtime: e.runtime ?? null,
        rating: Math.round((e.vote_average ?? 0) * 10) / 10,
      }),
    ),
  };
}

/* -------------------------------------------------------------------------
   Discovery
   ------------------------------------------------------------------------- */

export async function getTrending(): Promise<MediaItem[]> {
  const page = await tmdb<RawPage>("/trending/all/week", {}, 60 * 60 * 3);
  return normalizePage(page);
}

export async function getTrendingByType(type: MediaType): Promise<MediaItem[]> {
  const page = await tmdb<RawPage>(`/trending/${type}/week`, {}, 60 * 60 * 3);
  return normalizePage(page, type);
}

export async function getPopularMovies(): Promise<MediaItem[]> {
  const page = await tmdb<RawPage>("/movie/popular", {}, 60 * 60 * 6);
  return normalizePage(page, "movie");
}

export async function getPopularTV(): Promise<MediaItem[]> {
  const page = await tmdb<RawPage>("/tv/popular", {}, 60 * 60 * 6);
  return normalizePage(page, "tv");
}

/**
 * TMDB's /similar endpoint is noticeably weaker than /recommendations,
 * so recommendations lead and similar backfills.
 */
export async function getSimilar(
  type: MediaType,
  id: number,
): Promise<MediaItem[]> {
  const recs = await tmdbOrNull<RawPage>(
    `/${type}/${id}/recommendations`,
    {},
    60 * 60 * 12,
  );
  const items = recs ? await normalizePage(recs, type) : [];
  if (items.length >= 6) return items.slice(0, 18);

  const similar = await tmdbOrNull<RawPage>(
    `/${type}/${id}/similar`,
    {},
    60 * 60 * 12,
  );
  const extra = similar ? await normalizePage(similar, type) : [];
  const seen = new Set(items.map((i) => i.tmdbId));
  for (const item of extra) {
    if (!seen.has(item.tmdbId)) items.push(item);
  }
  return items.slice(0, 18);
}
