/** TMDB image URL construction. Sizes are picked per surface, not globally. */

const IMG = "https://image.tmdb.org/t/p";

export const POSTER = { sm: "w185", md: "w342", lg: "w500" } as const;
export const BACKDROP = { md: "w780", lg: "w1280", xl: "original" } as const;
export const STILL = { md: "w300", lg: "w500" } as const;
export const PROFILE = { md: "w185" } as const;

export function tmdbImage(
  path: string | null | undefined,
  size: string,
): string | null {
  if (!path) return null;
  return `${IMG}/${size}${path}`;
}
