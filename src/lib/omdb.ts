/**
 * OMDb, for IMDb, Rotten Tomatoes and Metacritic scores on title pages.
 *
 * Raw OMDb shapes stop here. Like MAL it is optional: without `OMDB_API_KEY`,
 * or on any failure, `getRatings` resolves to null and no strip renders.
 *
 * OMDb's terms allow personal, non-commercial use only. The free key is
 * capped at 1,000 requests a day, which is why responses are cached for a day.
 */

import type { Ratings } from "./types";

type Raw = {
  Response?: string;
  imdbRating?: string;
  imdbVotes?: string;
  Metascore?: string;
  Ratings?: Array<{ Source: string; Value: string }>;
};

const present = (value: string | undefined) =>
  value && value !== "N/A" ? value : null;

export async function getRatings(imdbId: string | null): Promise<Ratings | null> {
  const key = process.env.OMDB_API_KEY;
  if (!key || !imdbId || !/^tt\d+$/.test(imdbId)) return null;

  const url = new URL("https://www.omdbapi.com/");
  url.searchParams.set("i", imdbId);
  url.searchParams.set("apikey", key);

  try {
    const res = await fetch(url, { next: { revalidate: 60 * 60 * 24 } });
    if (!res.ok) return null;
    const raw = (await res.json()) as Raw;
    if (raw.Response !== "True") return null;

    const source = (name: string) =>
      present(raw.Ratings?.find((r) => r.Source === name)?.Value);

    const ratings: Ratings = {
      imdb: present(raw.imdbRating),
      imdbVotes: present(raw.imdbVotes),
      rottenTomatoes: source("Rotten Tomatoes"),
      metacritic: present(raw.Metascore),
      imdbUrl: `https://www.imdb.com/title/${imdbId}/`,
    };
    return ratings.imdb || ratings.rottenTomatoes || ratings.metacritic
      ? ratings
      : null;
  } catch {
    return null;
  }
}
