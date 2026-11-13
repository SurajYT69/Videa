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
  status: string | null;
  /** Set when the film belongs to a series of films. */
  collectionId: number | null;
} & TitleExtras;

export type TVDetails = MediaItem & {
  type: "tv";
  seasons: SeasonSummary[];
  creators: string[];
  cast: CastMember[];
  episodeRunTime: number | null;
  status: string | null;
  lastAirDate: string | null;
  episodeCount: number;
} & TitleExtras;

/** Reference facts that ride along on the one details request. */
export type TitleExtras = {
  /** The title's own logo artwork, when TMDB has one. */
  logoPath: string | null;
  /** YouTube key of the official trailer, when there is one. */
  trailerKey: string | null;
  /** ISO 639-1, e.g. "ja". Used to tell anime from other animation. */
  originalLanguage: string | null;
  studios: string[];
  languages: string[];
  /** Subscription services carrying the title. Shown, never linked. */
  providers: Provider[];
};

export type Provider = {
  name: string;
  logoPath: string;
};

/** A film series, e.g. a trilogy. Fetched on its own, behind Suspense. */
export type Collection = {
  name: string;
  overview: string;
  backdropPath: string | null;
  parts: MediaItem[];
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
/** MyAnimeList's view of an anime title. Optional, from `lib/mal.ts`. */
export type MalInfo = {
  id: number;
  title: string;
  score: number | null;
  rank: number | null;
  popularity: number | null;
  episodes: number | null;
  status: string | null;
  studios: string[];
  url: string;
};
/** A streaming service offered as a browse filter. */
export type ProviderOption = {
  id: number;
  name: string;
  logoPath: string;
};

/** An actor or crew member, with what they are known for. */
export type Person = {
  id: number;
  name: string;
  biography: string;
  profilePath: string | null;
  knownFor: string | null;
  birthday: string | null;
  placeOfBirth: string | null;
  credits: MediaItem[];
};

export type EpisodeRef = {
  season: number;
  episode: number;
  airDate: string | null;
};

/** When a series last aired and next airs. Drives the "New episodes" notice. */
export type Airing = {
  tmdbId: number;
  title: string;
  backdropPath: string | null;
  lastEpisode: EpisodeRef | null;
  nextEpisode: EpisodeRef | null;
};

/** Scores from OMDb. Each is null when OMDb has none. */
export type Ratings = {
  imdb: string | null;
  imdbVotes: string | null;
  rottenTomatoes: string | null;
  metacritic: string | null;
  imdbUrl: string;
};

/** A title airing this anime season, from MyAnimeList. */
export type SeasonalAnime = {
  malId: number;
  title: string;
  imageUrl: string | null;
  score: number | null;
  startDate: string | null;
};
