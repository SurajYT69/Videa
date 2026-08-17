"use client";

/**
 * LocalStorage persistence. No database, no accounts.
 *
 * Only the minimum needed to render a card is stored. Every read and write is
 * guarded: private-mode, quota-exceeded and corrupted-payload cases all
 * degrade to an empty state rather than throwing into a render.
 */

import type {
  ContinueWatchingItem,
  FavoriteItem,
  LocalState,
  MediaStub,
  MediaType,
  RecentItem,
} from "./types";

const KEY = "videa-app-state";
const MAX_RECENT = 24;
const MAX_CONTINUE = 20;

const EMPTY: LocalState = {
  version: 1,
  recentlyViewed: [],
  continueWatching: [],
  favorites: [],
  lastEpisodes: {},
};

/* -------------------------------------------------------------------------
   Store
   ------------------------------------------------------------------------- */

let cache: LocalState | null = null;
const listeners = new Set<() => void>();

function parse(raw: string | null): LocalState {
  if (!raw) return EMPTY;
  try {
    const parsed = JSON.parse(raw) as Partial<LocalState>;
    if (parsed.version !== 1) return EMPTY;
    return {
      version: 1,
      recentlyViewed: Array.isArray(parsed.recentlyViewed)
        ? parsed.recentlyViewed
        : [],
      continueWatching: Array.isArray(parsed.continueWatching)
        ? parsed.continueWatching
        : [],
      favorites: Array.isArray(parsed.favorites) ? parsed.favorites : [],
      lastEpisodes:
        parsed.lastEpisodes && typeof parsed.lastEpisodes === "object"
          ? parsed.lastEpisodes
          : {},
    };
  } catch {
    return EMPTY;
  }
}

function load(): LocalState {
  if (cache) return cache;
  if (typeof window === "undefined") return EMPTY;
  try {
    cache = parse(window.localStorage.getItem(KEY));
  } catch {
    cache = EMPTY;
  }
  return cache;
}

function commit(next: LocalState): void {
  cache = next;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* Quota or private mode. In-memory state stays correct for this session. */
  }
  for (const listener of listeners) listener();
}

function update(fn: (state: LocalState) => LocalState): void {
  if (typeof window === "undefined") return;
  commit(fn(load()));
}

/* useSyncExternalStore wiring -------------------------------------------- */

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);

  const onStorage = (event: StorageEvent) => {
    if (event.key === KEY) {
      cache = null;
      for (const l of listeners) l();
    }
  };
  window.addEventListener("storage", onStorage);

  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

/** Identity-stable between writes, which useSyncExternalStore requires. */
export function getSnapshot(): LocalState {
  return load();
}

export function getServerSnapshot(): LocalState {
  return EMPTY;
}

/* -------------------------------------------------------------------------
   Keys
   ------------------------------------------------------------------------- */

function idOf(type: MediaType, tmdbId: number): string {
  return `${type}:${tmdbId}`;
}

function sameItem(a: MediaStub, type: MediaType, tmdbId: number): boolean {
  return a.type === type && a.tmdbId === tmdbId;
}

/* -------------------------------------------------------------------------
   Recently viewed
   ------------------------------------------------------------------------- */

export function recordView(stub: MediaStub): void {
  update((state) => {
    const entry: RecentItem = { ...stub, viewedAt: Date.now() };
    const rest = state.recentlyViewed.filter(
      (i) => !sameItem(i, stub.type, stub.tmdbId),
    );
    return {
      ...state,
      recentlyViewed: [entry, ...rest].slice(0, MAX_RECENT),
    };
  });
}

export function clearRecentlyViewed(): void {
  update((state) => ({ ...state, recentlyViewed: [] }));
}

/* -------------------------------------------------------------------------
   Favorites
   ------------------------------------------------------------------------- */

export function toggleFavorite(stub: MediaStub): boolean {
  let added = false;
  update((state) => {
    const exists = state.favorites.some((i) =>
      sameItem(i, stub.type, stub.tmdbId),
    );
    if (exists) {
      return {
        ...state,
        favorites: state.favorites.filter(
          (i) => !sameItem(i, stub.type, stub.tmdbId),
        ),
      };
    }
    added = true;
    const entry: FavoriteItem = { ...stub, addedAt: Date.now() };
    return { ...state, favorites: [entry, ...state.favorites] };
  });
  return added;
}

export function removeFavorite(type: MediaType, tmdbId: number): void {
  update((state) => ({
    ...state,
    favorites: state.favorites.filter((i) => !sameItem(i, type, tmdbId)),
  }));
}

/* -------------------------------------------------------------------------
   Continue watching
   ------------------------------------------------------------------------- */

export function recordPlayback(
  stub: MediaStub,
  detail: { season?: number; episode?: number; progress?: number | null },
): void {
  update((state) => {
    const previous = state.continueWatching.find((i) =>
      sameItem(i, stub.type, stub.tmdbId),
    );

    const entry: ContinueWatchingItem = {
      ...stub,
      season: detail.season,
      episode: detail.episode,
      /* A newer real position wins; otherwise keep whatever we already knew. */
      progress:
        detail.progress ?? (previous && isSamePosition(previous, detail)
          ? previous.progress
          : null),
      updatedAt: Date.now(),
    };

    const rest = state.continueWatching.filter(
      (i) => !sameItem(i, stub.type, stub.tmdbId),
    );

    const lastEpisodes = { ...state.lastEpisodes };
    if (stub.type === "tv" && detail.season && detail.episode) {
      lastEpisodes[idOf("tv", stub.tmdbId)] = {
        season: detail.season,
        episode: detail.episode,
      };
    }

    return {
      ...state,
      continueWatching: [entry, ...rest].slice(0, MAX_CONTINUE),
      lastEpisodes,
    };
  });
}

function isSamePosition(
  previous: ContinueWatchingItem,
  detail: { season?: number; episode?: number },
): boolean {
  return (
    previous.season === detail.season && previous.episode === detail.episode
  );
}

export function removeFromContinueWatching(
  type: MediaType,
  tmdbId: number,
): void {
  update((state) => ({
    ...state,
    continueWatching: state.continueWatching.filter(
      (i) => !sameItem(i, type, tmdbId),
    ),
  }));
}

/* -------------------------------------------------------------------------
   Last watched episode
   ------------------------------------------------------------------------- */

export function getLastEpisode(
  state: LocalState,
  tmdbId: number,
): { season: number; episode: number } | null {
  return state.lastEpisodes[idOf("tv", tmdbId)] ?? null;
}
