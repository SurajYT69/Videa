"use client";

import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { X } from "@phosphor-icons/react";
import { FilterDropdown, type FilterOption } from "./FilterDropdown";
import { PROVIDER, tmdbImage } from "@/lib/images";
import { LANGUAGE_OPTIONS } from "@/lib/tmdb-options";
import type { Genre, ProviderOption } from "@/lib/types";

/**
 * Filter controls for the browse pages. Every value lives in the URL, so a
 * filtered list is shareable and back-navigation from a title restores it.
 * This is a client component only because the controls need handlers; the
 * grid it filters stays server-rendered.
 */

const CURRENT_YEAR = new Date().getFullYear();
const YEARS: FilterOption[] = Array.from({ length: CURRENT_YEAR - 1949 }, (_, i) => {
  const year = String(CURRENT_YEAR - i);
  return { value: year, label: year };
});

const RATINGS: FilterOption[] = [6, 7, 8, 9].map((n) => ({
  value: String(n),
  label: `${n}+ rating`,
}));

type Props = {
  /** Comes from `SORT_OPTIONS`, so the UI cannot offer a sort this type rejects. */
  sorts: Array<{ value: string; label: string }>;
  genres: Genre[];
  selectedGenres: number[];
  sort: string;
  year?: number;
  minRating?: number;
  language?: string;
  providers: ProviderOption[];
  provider?: number;
};

export function BrowseFilters({
  sorts,
  genres,
  selectedGenres,
  sort,
  year,
  minRating,
  language,
  providers,
  provider,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const active =
    selectedGenres.length > 0 ||
    year !== undefined ||
    minRating !== undefined ||
    language !== undefined ||
    provider !== undefined ||
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

  return (
    <div className="space-y-5">
      {providers.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="eyebrow mr-2">On</span>
          {providers.map((option) => {
            const on = option.id === provider;
            return (
              <button
                key={option.id}
                type="button"
                aria-pressed={on}
                title={option.name}
                onClick={() => apply({ provider: on ? undefined : String(option.id) })}
                className={`grid size-11 place-items-center rounded-card p-1 transition duration-200 ${
                  on ? "bg-fg ring-2 ring-accent" : "glass opacity-80 hover:opacity-100"
                }`}
              >
                <Image
                  src={tmdbImage(option.logoPath, PROVIDER.sm) ?? ""}
                  alt={option.name}
                  width={36}
                  height={36}
                  className="size-9 rounded-mini"
                />
              </button>
            );
          })}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        {genres.length > 0 && (
          <FilterDropdown
            placeholder="All genres"
            label="Genres"
            multiple
            options={genres.map((g) => ({ value: String(g.id), label: g.name }))}
            selected={selectedGenres.map(String)}
            /* Pipe is OR: picking two genres widens the list rather than emptying it. */
            onChange={(values) => apply({ genres: values.length ? values.join("|") : undefined })}
          />
        )}
        <FilterDropdown
          placeholder="All languages"
          label="Original language"
          options={LANGUAGE_OPTIONS}
          selected={language ? [language] : []}
          onChange={([value]) => apply({ lang: value })}
        />
        <FilterDropdown
          placeholder="Any year"
          label="Release year"
          options={YEARS}
          selected={year ? [String(year)] : []}
          onChange={([value]) => apply({ year: value })}
        />
        <FilterDropdown
          placeholder="Any rating"
          label="Minimum rating"
          options={RATINGS}
          selected={minRating ? [String(minRating)] : []}
          onChange={([value]) => apply({ rating: value })}
        />

        {active && (
          <button
            type="button"
            onClick={() =>
              apply({
                genres: undefined,
                sort: undefined,
                year: undefined,
                rating: undefined,
                lang: undefined,
                provider: undefined,
              })
            }
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm text-fg-3 transition-colors duration-200 hover:text-fg"
          >
            <X className="size-3.5" aria-hidden="true" />
            Clear
          </button>
        )}

        <div className="ml-auto">
          <FilterDropdown
            placeholder="Most popular"
            label="Sort by"
            align="end"
            options={sorts}
            selected={sort === "popularity.desc" ? [] : [sort]}
            onChange={([value]) => apply({ sort: value })}
          />
        </div>
      </div>
    </div>
  );
}
