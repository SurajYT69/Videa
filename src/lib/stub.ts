import type { MediaItem, MediaStub } from "./types";

/**
 * Widens a stored stub back to the shared model so library views can reuse
 * the same card components. Fields that are not persisted stay empty; no card
 * surface reads them.
 */
export function fromStub(stub: MediaStub): MediaItem {
  return {
    ...stub,
    overview: "",
    genres: [],
  };
}

/** Narrows a full media object down to what LocalStorage is allowed to keep. */
export function toStub(media: MediaItem): MediaStub {
  return {
    tmdbId: media.tmdbId,
    imdbId: media.imdbId,
    type: media.type,
    title: media.title,
    posterPath: media.posterPath,
    backdropPath: media.backdropPath,
    releaseDate: media.releaseDate,
    rating: media.rating,
  };
}
