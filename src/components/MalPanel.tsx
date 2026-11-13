import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { getMalInfo } from "@/lib/mal";
import type { MediaType } from "@/lib/types";

type Props = {
  title: string;
  originalTitle?: string;
  year: string | null;
  type: MediaType;
};

/**
 * MyAnimeList's numbers for an anime title. A separate request, so it streams
 * behind Suspense and renders nothing when MAL has no confident match.
 */
export async function MalPanel({ title, originalTitle, year, type }: Props) {
  const info =
    (await getMalInfo(title, year, type)) ??
    (originalTitle && originalTitle !== title
      ? await getMalInfo(originalTitle, year, type)
      : null);
  if (!info) return null;

  const facts: Array<[string, string | null]> = [
    ["MAL score", info.score ? info.score.toFixed(2) : null],
    ["Ranked", info.rank ? `#${info.rank.toLocaleString("en-US")}` : null],
    ["Popularity", info.popularity ? `#${info.popularity.toLocaleString("en-US")}` : null],
    ["Episodes", info.episodes ? String(info.episodes) : null],
    ["Status", info.status],
    ["Studio", info.studios.join(", ") || null],
  ];
  const shown = facts.filter((fact): fact is [string, string] => Boolean(fact[1]));

  return (
    <div className="page pt-2 pb-2">
      <div className="glass flex flex-wrap items-center justify-between gap-6 rounded-card px-5 py-4 md:px-6">
        <dl className="flex flex-wrap items-center gap-x-8 gap-y-3">
          {shown.map(([label, value]) => (
            <div key={label}>
              <dt className="eyebrow">{label}</dt>
              <dd
                className={`mt-1 tabular-nums ${
                  label === "MAL score"
                    ? "display text-2xl text-accent"
                    : "text-sm text-fg"
                }`}
              >
                {value}
              </dd>
            </div>
          ))}
        </dl>

        <a
          href={info.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm text-fg-2 transition-colors duration-200 hover:bg-white/10 hover:text-fg"
        >
          View on MyAnimeList
          <ArrowUpRight className="size-3.5" aria-hidden="true" />
        </a>
      </div>
    </div>
  );
}
