/**
 * MyAnimeList, for anime title pages only.
 *
 * Raw MAL shapes stop here, the same way TMDB's stop at `tmdb.ts`. Unlike TMDB,
 * MAL is optional: with no `MAL_CLIENT_ID`, or on any failure, every function
 * resolves to null and the page simply has no MAL panel.
 */

import type { MalInfo, MediaType, SeasonalAnime } from "./types";

const BASE = "https://api.myanimelist.net/v2";

const FIELDS = [
  "mean",
  "rank",
  "popularity",
  "num_episodes",
  "status",
  "studios",
  "start_date",
  "media_type",
].join(",");

type RawNode = {
  id: number;
  title: string;
  mean?: number;
  rank?: number;
  popularity?: number;
  num_episodes?: number;
  status?: string;
  studios?: Array<{ name: string }>;
  start_date?: string;
  media_type?: string;
};

const STATUS: Record<string, string> = {
  finished_airing: "Finished airing",
  currently_airing: "Airing",
  not_yet_aired: "Not yet aired",
};

/** TMDB marks anime as Japanese-language animation; nothing else is looked up. */
export function isAnime(genres: string[], originalLanguage: string | null): boolean {
  return originalLanguage === "ja" && genres.includes("Animation");
}

/**
 * Finds the MAL entry for a TMDB title by searching its name and keeping the
 * result that started the same year and is the same kind (series or film).
 * Matching by year is what stops "Season 2" or a recap film winning over the
 * show itself. No confident match means no panel, never a wrong one.
 */
export async function getMalInfo(
  query: string,
  year: string | null,
  type: MediaType,
): Promise<MalInfo | null> {
  const clientId = process.env.MAL_CLIENT_ID;
  if (!clientId || !query.trim() || !year) return null;

  const url = new URL(`${BASE}/anime`);
  /* MAL rejects queries over 64 characters. */
  url.searchParams.set("q", query.slice(0, 64));
  url.searchParams.set("limit", "10");
  url.searchParams.set("fields", FIELDS);

  try {
    const res = await fetch(url, {
      headers: { "X-MAL-CLIENT-ID": clientId },
      next: { revalidate: 60 * 60 * 24 },
    });
    if (!res.ok) return null;

    const data = (await res.json()) as { data?: Array<{ node: RawNode }> };
    const wanted = type === "movie" ? ["movie"] : ["tv", "ona", "ova"];
    const node = (data.data ?? [])
      .map((d) => d.node)
      .find(
        (n) =>
          n.start_date?.slice(0, 4) === year &&
          wanted.includes(n.media_type ?? ""),
      );
    if (!node) return null;

    return {
      id: node.id,
      title: node.title,
      score: node.mean ?? null,
      rank: node.rank ?? null,
      popularity: node.popularity ?? null,
      episodes: node.num_episodes || null,
      status: node.status ? (STATUS[node.status] ?? null) : null,
      studios: (node.studios ?? []).map((s) => s.name).slice(0, 2),
      url: `https://myanimelist.net/anime/${node.id}`,
    };
  } catch {
    return null;
  }
}
const SEASONS = ["winter", "spring", "summer", "fall"] as const;

/** MAL's seasons are calendar quarters: Jan–Mar is winter, and so on. */
export function currentSeason(now = new Date()) {
  const season = SEASONS[Math.floor(now.getMonth() / 3)]!;
  const year = now.getFullYear();
  const label = `${season.charAt(0).toUpperCase()}${season.slice(1)} ${year}`;
  return { season, year, label };
}

/** The most-followed series airing this season. Empty on any failure. */
export async function getSeasonalAnime(): Promise<SeasonalAnime[]> {
  const clientId = process.env.MAL_CLIENT_ID;
  if (!clientId) return [];
  const { season, year } = currentSeason();

  const url = new URL(`${BASE}/anime/season/${year}/${season}`);
  url.searchParams.set("sort", "anime_num_list_users");
  url.searchParams.set("limit", "24");
  url.searchParams.set("fields", "mean,start_date,media_type,alternative_titles");

  type Raw = {
    id: number;
    title: string;
    main_picture?: { medium?: string; large?: string };
    mean?: number;
    start_date?: string;
    media_type?: string;
    alternative_titles?: { en?: string };
  };

  try {
    const res = await fetch(url, {
      headers: { "X-MAL-CLIENT-ID": clientId },
      next: { revalidate: 60 * 60 * 6 },
    });
    if (!res.ok) return [];
    const data = (await res.json()) as { data?: Array<{ node: Raw }> };
    return (data.data ?? [])
      .map((d) => d.node)
      .filter((n) => n.media_type === "tv" || n.media_type === "ona")
      .slice(0, 18)
      .map((n) => ({
        malId: n.id,
        /* The English title searches better against TMDB than the romaji. */
        title: n.alternative_titles?.en || n.title,
        imageUrl: n.main_picture?.large ?? n.main_picture?.medium ?? null,
        score: n.mean ?? null,
        startDate: n.start_date ?? null,
      }));
  } catch {
    return [];
  }
}
