import { Suspense } from "react";
import { BrowseFilters } from "./BrowseFilters";
import { LoadMore } from "./LoadMore";
import { MediaGrid } from "./MediaGrid";
import { EmptyState } from "./EmptyState";
import { ErrorState } from "./ErrorState";
import { GridSkeleton } from "./LoadingSkeleton";
import {
  ConfigError,
  SORT_OPTIONS,
  discover,
  getGenres,
  type DiscoverParams,
  type Paged,
} from "@/lib/tmdb";
import type { Genre, MediaItem, MediaType } from "@/lib/types";

/**
 * The filtered, paginated listing shared by /movie and /tv. Filters and paging
 * are one unit because both live in the same query string: the filter bar
 * writes it, this reads it.
 */

export type BrowseSearchParams = Record<string, string | string[] | undefined>;

/*
 * `page` counts how many pages are loaded, not which one is shown. The grid
 * accumulates, so a shared URL restores the same list and back-navigation from
 * a title lands where it left — neither of which survives client-only append
 * state. The cost is one TMDB request per loaded page, which is why the depth
 * is bounded: a hand-typed ?page=500 would otherwise fan out 500 of them.
 *
 * ponytail: 25 pages is 500 titles, well past where anyone keeps clicking. If
 * deeper browsing ever matters, move to a cursor and append on the client.
 */
const MAX_LOADED_PAGES = 25;

const CURRENT_YEAR = new Date().getFullYear();

function one(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/** Out-of-range and non-numeric values are dropped, never forwarded to TMDB. */
function num(
  value: string | undefined,
  min: number,
  max: number,
): number | undefined {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= min && parsed <= max
    ? parsed
    : undefined;
}

/** Clamped rather than rejected, so a stale ?page=900 link still renders. */
function parsePage(value: string | undefined): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 1;
  return Math.min(Math.max(1, Math.floor(parsed)), MAX_LOADED_PAGES);
}

function parseFilters(
  type: MediaType,
  searchParams: BrowseSearchParams,
): DiscoverParams {
  const sort = one(searchParams.sort);
  const genres = one(searchParams.genres)
    ?.split("|")
    .map(Number)
    .filter((id) => Number.isInteger(id) && id > 0);

  return {
    /* Anything the endpoint would reject is dropped rather than passed on. */
    sort: SORT_OPTIONS[type].some((option) => option.value === sort)
      ? sort
      : undefined,
    genres: genres?.length ? genres : undefined,
    year: num(one(searchParams.year), 1900, CURRENT_YEAR + 1),
    minRating: num(one(searchParams.rating), 1, 9),
  };
}

/** Carries the current filters forward; only the page number changes. */
function pageHref(
  type: MediaType,
  searchParams: BrowseSearchParams,
  page: number,
): string {
  const next = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    const single = one(value);
    if (key !== "page" && single) next.set(key, single);
  }
  next.set("page", String(page));
  /* The two browse routes are named for their media type. */
  return `/${type}?${next}`;
}

export async function Browse({
  type,
  searchParams,
}: {
  type: MediaType;
  searchParams: BrowseSearchParams;
}) {
  const page = parsePage(one(searchParams.page));
  const filters = parseFilters(type, searchParams);

  /* Seven-day cached, and the controls cannot render without it. */
  const genres = await getGenres(type).catch((error: unknown) => {
    if (error instanceof ConfigError) throw error;
    return [] as Genre[];
  });

  /*
   * The filter bar sits outside the boundary on purpose: inside it, changing a
   * filter would blank the control the viewer is touching. The key is what
   * makes the results fall back to a skeleton when a filter changes — a new
   * list is coming, so holding the old one on screen would be a lie.
   *
   * `page` is deliberately not part of it. Load more adds to the list it is
   * standing at the bottom of; remounting there would swap those results for a
   * skeleton, and the shorter document then throws the viewer back to the top.
   */
  const key = [
    filters.sort,
    filters.genres?.join("|"),
    filters.year,
    filters.minRating,
  ].join("~");

  /* The caller owns the section frame and the page gutter. */
  return (
    <>
      <BrowseFilters
        sorts={SORT_OPTIONS[type]}
        genres={genres}
        selectedGenres={filters.genres ?? []}
        sort={filters.sort ?? "popularity.desc"}
        year={filters.year}
        minRating={filters.minRating}
      />

      <div className="mt-10 md:mt-12">
        <Suspense key={key} fallback={<GridSkeleton count={18} />}>
          <BrowseResults
            type={type}
            page={page}
            filters={filters}
            searchParams={searchParams}
          />
        </Suspense>
      </div>
    </>
  );
}

async function BrowseResults({
  type,
  page,
  filters,
  searchParams,
}: {
  type: MediaType;
  page: number;
  filters: DiscoverParams;
  searchParams: BrowseSearchParams;
}) {
  let pages: Array<Paged<MediaItem>>;
  try {
    pages = await Promise.all(
      Array.from({ length: page }, (_, index) =>
        discover(type, { ...filters, page: index + 1 }),
      ),
    );
  } catch (error) {
    if (error instanceof ConfigError) throw error;
    return (
      <ErrorState
        title="We can't reach the catalogue."
        description="The metadata service is not responding. Try reloading in a moment."
      />
    );
  }

  /*
   * TMDB does not promise stable pagination — a title moves between pages as
   * popularity shifts, so it can arrive twice while pages accumulate. Their own
   * guidance is to track ids and skip the repeats.
   */
  const seen = new Set<number>();
  const items: MediaItem[] = [];
  for (const result of pages) {
    for (const item of result.items) {
      if (seen.has(item.tmdbId)) continue;
      seen.add(item.tmdbId);
      items.push(item);
    }
  }

  if (!items.length) {
    return (
      <EmptyState
        title="Nothing matches those filters."
        description="Try widening the year, lowering the rating, or picking fewer genres."
        action={{ href: `/${type}`, label: "Clear filters" }}
      />
    );
  }

  const first = pages[0];
  const totalPages = Math.min(first?.totalPages ?? 1, MAX_LOADED_PAGES);
  const totalResults = first?.totalResults ?? 0;

  return (
    <>
      {/* No priority: this grid sits below the page header and the filter bar. */}
      <MediaGrid items={items} />

      <div className="mt-14 flex flex-col items-center gap-5">
        <p className="meta">
          {items.length} of {totalResults.toLocaleString("en-US")} titles
        </p>

        {page < totalPages && (
          <LoadMore
            href={pageHref(type, searchParams, page + 1)}
            className="inline-flex items-center rounded-card border border-line-strong bg-raised px-6 py-3 text-sm font-medium text-fg transition duration-200 hover:-translate-y-px hover:border-fg-3 hover:shadow-soft active:translate-y-0"
          >
            Load more
          </LoadMore>
        )}
      </div>
    </>
  );
}
