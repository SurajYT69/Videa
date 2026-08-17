import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { MediaGrid } from "@/components/MediaGrid";
import { SearchBar } from "@/components/SearchBar";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { GridSkeleton } from "@/components/LoadingSkeleton";
import { ConfigError, searchMovies, searchMulti, searchTV } from "@/lib/tmdb";

type Props = { searchParams: Promise<{ q?: string; type?: string }> };

/** `all` is the absence of the param, so the plain /search?q= link stays clean. */
const FILTERS = [
  { value: "all", label: "All" },
  { value: "movie", label: "Movies" },
  { value: "tv", label: "Series" },
] as const;

type Filter = (typeof FILTERS)[number]["value"];

export async function generateMetadata({
  searchParams,
}: Props): Promise<Metadata> {
  const { q } = await searchParams;
  const query = q?.trim();

  return {
    title: query ? `Search: ${query}` : "Search",
    description: query
      ? `Movies and series matching "${query}".`
      : "Search movies and TV shows by name.",
    /* Result pages are not useful entry points from search engines. */
    robots: { index: false, follow: true },
  };
}

export default async function SearchPage({ searchParams }: Props) {
  const { q, type } = await searchParams;
  const query = q?.trim() ?? "";
  const filter: Filter = type === "movie" || type === "tv" ? type : "all";

  if (!query) {
    return (
      <div className="relative isolate">
        <div
          aria-hidden="true"
          className="brand-wash pointer-events-none absolute inset-0 -z-10 opacity-70"
        />
        <div className="page flex min-h-[80dvh] flex-col justify-center pt-32 pb-24">
          <div className="flex items-center gap-3">
            <span className="h-px w-8 bg-fg-3/50" />
            <span className="eyebrow">Search</span>
          </div>
          <h1 className="display display-page mt-5 max-w-[14ch] text-fg text-balance">
            What do you want to watch?
          </h1>
          <p className="mt-5 max-w-md text-[15px] leading-relaxed text-fg-2">
            Type a title. Everything else is handled for you.
          </p>
          <div className="mt-9 max-w-xl">
            <SearchBar autoFocus variant="block" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-20 md:pt-40">
      <header className="page">
        <div className="flex items-center gap-3">
          <span className="h-px w-8 bg-fg-3/50" />
          <span className="eyebrow">Search</span>
        </div>
        <h1 className="display display-page mt-5 max-w-[18ch] text-fg text-balance">
          &ldquo;{query}&rdquo;
        </h1>

        {/*
          Plain links: switching the type needs no state, so it needs no client
          component. They sit outside the boundary below, so they stay visible
          and clickable while the results they change are loading.
        */}
        <nav aria-label="Filter results by type" className="mt-8 flex gap-2">
          {FILTERS.map((option) => {
            const on = option.value === filter;
            return (
              <Link
                key={option.value}
                href={`/search?q=${encodeURIComponent(query)}${
                  option.value === "all" ? "" : `&type=${option.value}`
                }`}
                scroll={false}
                aria-current={on ? "page" : undefined}
                className={`rounded-card border px-4 py-2 text-sm transition duration-200 hover:-translate-y-px ${
                  on
                    ? "border-fg bg-fg text-ink"
                    : "border-line-strong text-fg-2 hover:border-fg-3"
                }`}
              >
                {option.label}
              </Link>
            );
          })}
        </nav>
      </header>

      <div className="page mt-12">
        <Suspense
          key={`${query}~${filter}`}
          fallback={<GridSkeleton count={12} />}
        >
          <SearchResults query={query} filter={filter} />
        </Suspense>
      </div>
    </div>
  );
}

async function SearchResults({
  query,
  filter,
}: {
  query: string;
  filter: Filter;
}) {
  let results;
  try {
    results =
      filter === "movie"
        ? await searchMovies(query)
        : filter === "tv"
          ? await searchTV(query)
          : await searchMulti(query);
  } catch (error) {
    if (error instanceof ConfigError) throw error;
    return (
      <ErrorState
        title="Search is unavailable."
        description="We could not reach the catalogue. Try again in a moment."
      />
    );
  }

  if (!results.length) {
    return (
      <EmptyState
        title="No titles found."
        description="Check the spelling, or try a shorter version of the name."
      >
        <div className="mt-7 w-full max-w-md">
          <SearchBar variant="block" placeholder="Try another search" />
        </div>
      </EmptyState>
    );
  }

  return (
    <>
      <p className="meta">
        {results.length} result{results.length === 1 ? "" : "s"}
      </p>
      <div className="mt-6">
        <MediaGrid items={results} priorityCount={6} />
      </div>
    </>
  );
}
