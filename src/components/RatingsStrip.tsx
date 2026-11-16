import { Suspense } from "react";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { getRatings } from "@/lib/omdb";

/** Critic and audience scores from OMDb. Streams; renders nothing without data. */
async function Strip({ imdbId }: { imdbId: string | null }) {
  const ratings = await getRatings(imdbId);
  if (!ratings) return null;

  /* Value, then the scale it is out of, set smaller so the number leads. */
  const scores: Array<[label: string, value: string | null, scale?: string, note?: string]> = [
    ["IMDb", ratings.imdb, "/10", ratings.imdbVotes ? `${ratings.imdbVotes} votes` : undefined],
    ["Rotten Tomatoes", ratings.rottenTomatoes],
    ["Metacritic", ratings.metacritic, "/100"],
  ];
  if (!scores.some(([, value]) => value)) return null;

  return (
    <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-5">
      <dl className="flex flex-wrap items-end gap-x-10 gap-y-5 md:gap-x-14">
        {scores.map(([label, value, scale, note]) =>
          value ? (
            <div key={label}>
              <dt className="eyebrow">{label}</dt>
              <dd className="mt-2 flex items-baseline gap-2">
                <span className="display text-3xl leading-none text-fg tabular-nums md:text-4xl">
                  {value}
                  {scale && <span className="text-base text-fg-3">{scale}</span>}
                </span>
                {note && <span className="meta whitespace-nowrap">{note}</span>}
              </dd>
            </div>
          ) : null,
        )}
      </dl>

      <a
        href={ratings.imdbUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="glass inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm whitespace-nowrap text-fg-2 transition-colors duration-200 hover:text-fg"
      >
        View on IMDb
        <ArrowUpRight className="size-3.5" aria-hidden="true" />
      </a>
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
