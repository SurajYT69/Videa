import { Suspense } from "react";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { getRatings } from "@/lib/omdb";

/** Critic and audience scores from OMDb. Streams; renders nothing without data. */
async function Strip({ imdbId }: { imdbId: string | null }) {
  const ratings = await getRatings(imdbId);
  if (!ratings) return null;

  const scores: Array<[string, string | null, string?]> = [
    ["IMDb", ratings.imdb && `${ratings.imdb}/10`, ratings.imdbVotes ? `${ratings.imdbVotes} votes` : undefined],
    ["Rotten Tomatoes", ratings.rottenTomatoes],
    ["Metacritic", ratings.metacritic && `${ratings.metacritic}/100`],
  ];

  return (
    <div className="page pt-2 pb-2">
      <div className="glass flex flex-wrap items-center justify-between gap-6 rounded-card px-5 py-4 md:px-6">
        <dl className="flex flex-wrap items-center gap-x-10 gap-y-3">
          {scores.map(([label, value, note]) =>
            value ? (
              <div key={label}>
                <dt className="eyebrow">{label}</dt>
                <dd className="mt-1 flex items-baseline gap-2">
                  <span className="display text-2xl text-fg tabular-nums">{value}</span>
                  {note && <span className="meta">{note}</span>}
                </dd>
              </div>
            ) : null,
          )}
        </dl>

        <a
          href={ratings.imdbUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm text-fg-2 transition-colors duration-200 hover:bg-white/10 hover:text-fg"
        >
          View on IMDb
          <ArrowUpRight className="size-3.5" aria-hidden="true" />
        </a>
      </div>
    </div>
  );
}

export function RatingsStrip({ imdbId }: { imdbId: string | null }) {
  if (!imdbId) return null;
  return (
    <Suspense fallback={null}>
      <Strip imdbId={imdbId} />
    </Suspense>
  );
}
