import type { Metadata } from "next";
import { MediaGrid } from "@/components/MediaGrid";
import { SearchBar } from "@/components/SearchBar";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { ConfigError, searchMulti } from "@/lib/tmdb";

type Props = { searchParams: Promise<{ q?: string }> };

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
  const { q } = await searchParams;
  const query = q?.trim() ?? "";

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

  let results;
  try {
    results = await searchMulti(query);
  } catch (error) {
    if (error instanceof ConfigError) throw error;
    return (
      <ErrorState
        title="Search is unavailable."
        description="We could not reach the catalogue. Try again in a moment."
      />
    );
  }

  return (
    <div className="pt-32 pb-20 md:pt-40">
      <header className="page">
        <div className="flex items-center gap-3">
          <span className="h-px w-8 bg-fg-3/50" />
          <span className="eyebrow">
            {results.length === 0
              ? "No results"
              : `${results.length} result${results.length === 1 ? "" : "s"}`}
          </span>
        </div>
        <h1 className="display display-page mt-5 max-w-[18ch] text-fg text-balance">
          &ldquo;{query}&rdquo;
        </h1>
      </header>

      <div className="page mt-12">
        {results.length === 0 ? (
          <EmptyState
            title="No titles found."
            description="Check the spelling, or try a shorter version of the name."
          >
            <div className="mt-7 w-full max-w-md">
              <SearchBar variant="block" placeholder="Try another search" />
            </div>
          </EmptyState>
        ) : (
          <MediaGrid items={results} priorityCount={6} />
        )}
      </div>
    </div>
  );
}
