"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { Genre } from "@/lib/types";

/**
 * Filter controls for the browse pages. Every value lives in the URL, so a
 * filtered list is shareable and back-navigation from a title restores it.
 * This is a client component only because a `<select>` needs an onChange; the
 * grid it filters stays server-rendered.
 */

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: CURRENT_YEAR - 1949 }, (_, i) =>
  String(CURRENT_YEAR - i),
);

const RATINGS = [6, 7, 8, 9];

const FIELD =
  "rounded-card border border-line-strong bg-surface px-3 py-2.5 text-sm text-fg transition-colors duration-200 hover:border-fg-3/60";

type Props = {
  /** Comes from `SORT_OPTIONS`, so the UI cannot offer a sort this type rejects. */
  sorts: Array<{ value: string; label: string }>;
  genres: Genre[];
  selectedGenres: number[];
  sort: string;
  year?: number;
  minRating?: number;
};

export function BrowseFilters({
  sorts,
  genres,
  selectedGenres,
  sort,
  year,
  minRating,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const active =
    selectedGenres.length > 0 ||
    year !== undefined ||
    minRating !== undefined ||
    sort !== "popularity.desc";

  const apply = (changes: Record<string, string | undefined>) => {
    const next = new URLSearchParams(params.toString());
    for (const [key, value] of Object.entries(changes)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    /*
     * Any filter change invalidates every page loaded so far, so the list
     * always restarts at one. Without this, narrowing a filter from page 6
     * would show page 6 of a list the viewer has never seen the top of.
     */
    next.delete("page");
    const query = next.toString();
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  const toggleGenre = (id: number) => {
    const next = selectedGenres.includes(id)
      ? selectedGenres.filter((g) => g !== id)
      : [...selectedGenres, id];
    /* Pipe is OR: picking two genres widens the list rather than emptying it. */
    apply({ genres: next.length ? next.join("|") : undefined });
  };

  return (
    <div>
      {genres.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {genres.map((genre) => {
            const on = selectedGenres.includes(genre.id);
            return (
              <button
                key={genre.id}
                type="button"
                aria-pressed={on}
                onClick={() => toggleGenre(genre.id)}
                className={`rounded-card border px-3 py-1.5 text-xs transition duration-200 hover:-translate-y-px ${
                  on
                    ? "border-fg bg-fg text-ink"
                    : "border-line-strong text-fg-2 hover:border-fg-3"
                }`}
              >
                {genre.name}
              </button>
            );
          })}
        </div>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <label>
          <span className="sr-only">Sort by</span>
          <select
            className={FIELD}
            value={sort}
            onChange={(event) => {
              const value = event.target.value;
              apply({
                sort: value === "popularity.desc" ? undefined : value,
              });
            }}
          >
            {sorts.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span className="sr-only">Release year</span>
          <select
            className={FIELD}
            value={year ? String(year) : ""}
            onChange={(event) => apply({ year: event.target.value })}
          >
            <option value="">Any year</option>
            {YEARS.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span className="sr-only">Minimum rating</span>
          <select
            className={FIELD}
            value={minRating ? String(minRating) : ""}
            onChange={(event) => apply({ rating: event.target.value })}
          >
            <option value="">Any rating</option>
            {RATINGS.map((value) => (
              <option key={value} value={String(value)}>
                {value}+
              </option>
            ))}
          </select>
        </label>

        {active && (
          <button
            type="button"
            onClick={() =>
              apply({
                genres: undefined,
                sort: undefined,
                year: undefined,
                rating: undefined,
              })
            }
            className="text-sm text-fg-3 underline underline-offset-4 transition-colors duration-200 hover:text-fg"
          >
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}
