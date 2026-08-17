/**
 * The application's internal source of truth.
 * Raw TMDB response shapes never leave `lib/tmdb.ts`.
 */

export type MediaType = "movie" | "tv";

export type MediaItem = {
  tmdbId: number;
  imdbId: string | null;
  type: MediaType;
  title: string;
  originalTitle?: string;
  posterPath: string | null;
  backdropPath: string | null;
  overview: string;
  releaseDate: string | null;
  rating: number;
  genres: string[];
};

/** Everything a details page needs beyond the shared model. */
export type MovieDetails = MediaItem & {
  type: "movie";
  runtime: number | null;
  tagline: string | null;
  cast: CastMember[];
  certification: string | null;
};

export type TVDetails = MediaItem & {
  type: "tv";
  seasons: SeasonSummary[];
  creators: string[];
  cast: CastMember[];
  episodeRunTime: number | null;
  status: string | null;
  lastAirDate: string | null;
};

/** A filterable genre, as offered by the browse pages. */
export type Genre = {
  id: number;
  name: string;
};

export type CastMember = {
  id: number;
  name: string;
  character: string;
  profilePath: string | null;
};

export type SeasonSummary = {
  seasonNumber: number;
  name: string;
  episodeCount: number;
  airDate: string | null;
  posterPath: string | null;
};

export type Episode = {
  seasonNumber: number;
  episodeNumber: number;
  name: string;
  overview: string;
  stillPath: string | null;
  airDate: string | null;
  runtime: number | null;
  rating: number;
};

export type Season = {
  seasonNumber: number;
  name: string;
  overview: string;
  episodes: Episode[];
};

/* -------------------------------------------------------------------------
   Local persistence
   ------------------------------------------------------------------------- */

/** The minimum needed to render a card. Never a full TMDB payload. */
export type MediaStub = {
  tmdbId: number;
  imdbId: string | null;
  type: MediaType;
  title: string;
  posterPath: string | null;
  backdropPath: string | null;
  releaseDate: string | null;
  rating: number;
};

export type ContinueWatchingItem = MediaStub & {
  season?: number;
  episode?: number;
  /** 0-1. Null when the player never reported a real position. */
  progress: number | null;
  updatedAt: number;
};

export type FavoriteItem = MediaStub & {
  addedAt: number;
};

export type RecentItem = MediaStub & {
  viewedAt: number;
};

export type LocalState = {
  version: 1;
  recentlyViewed: RecentItem[];
  continueWatching: ContinueWatchingItem[];
  favorites: FavoriteItem[];
  lastEpisodes: Record<string, { season: number; episode: number }>;
};
