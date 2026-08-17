import type { MediaType } from "./types";

export function year(date: string | null | undefined): string | null {
  if (!date) return null;
  const y = date.slice(0, 4);
  return /^\d{4}$/.test(y) ? y : null;
}

export function typeLabel(type: MediaType): string {
  return type === "movie" ? "Movie" : "Series";
}

/** 142 -> "2h 22m", 48 -> "48m" */
export function runtimeLabel(minutes: number | null | undefined): string | null {
  if (!minutes || minutes <= 0) return null;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (!h) return `${m}m`;
  return m ? `${h}h ${m}m` : `${h}h`;
}

export function airDateLabel(date: string | null | undefined): string | null {
  if (!date) return null;
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** 2, 4 -> "S02 E04" */
export function episodeCode(season: number, episode: number): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `S${pad(season)} E${pad(episode)}`;
}

export function ratingLabel(rating: number): string | null {
  if (!rating || rating <= 0) return null;
  return rating.toFixed(1);
}

/** Joins metadata fragments, dropping empties. One separator, one line. */
export function metaLine(...parts: Array<string | null | undefined>): string {
  return parts.filter(Boolean).join("  ·  ");
}
