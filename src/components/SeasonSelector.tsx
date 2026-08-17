"use client";

import { useEffect, useRef, useState } from "react";
import { EpisodeList } from "./EpisodeList";
import { EpisodeListSkeleton } from "./LoadingSkeleton";
import { getLastEpisode } from "@/lib/storage";
import { useLibrary } from "@/lib/useLibrary";
import type { Season, SeasonSummary } from "@/lib/types";

type Props = {
  tvId: number;
  seasons: SeasonSummary[];
  /** Rendered on the server so the first season needs no client fetch. */
  initialSeason: Season | null;
};

type Status = "ready" | "loading" | "error";

export function SeasonSelector({ tvId, seasons, initialSeason }: Props) {
  const library = useLibrary();
  const resumeAt = getLastEpisode(library, tvId);

  const firstSeason = seasons[0]?.seasonNumber ?? 1;
  const [selected, setSelected] = useState(
    initialSeason?.seasonNumber ?? firstSeason,
  );
  const [status, setStatus] = useState<Status>(initialSeason ? "ready" : "loading");
  const [retryKey, setRetryKey] = useState(0);

  const cache = useRef<Map<number, Season>>(
    new Map(initialSeason ? [[initialSeason.seasonNumber, initialSeason]] : []),
  );
  const [season, setSeason] = useState<Season | null>(initialSeason);

  /* Jump to the season the viewer last watched, once, on first mount. */
  const jumped = useRef(false);
  useEffect(() => {
    if (jumped.current || !resumeAt) return;
    jumped.current = true;
    if (seasons.some((s) => s.seasonNumber === resumeAt.season)) {
      setSelected(resumeAt.season);
    }
  }, [resumeAt, seasons]);

  useEffect(() => {
    const cached = cache.current.get(selected);
    if (cached) {
      setSeason(cached);
      setStatus("ready");
      return;
    }

    const controller = new AbortController();
    setStatus("loading");

    (async () => {
      try {
        const res = await fetch(
          `/api/season?tv=${tvId}&season=${selected}`,
          { signal: controller.signal },
        );
        if (!res.ok) throw new Error("request failed");
        const data = (await res.json()) as { season: Season };
        cache.current.set(selected, data.season);
        setSeason(data.season);
        setStatus("ready");
      } catch (error) {
        if ((error as Error).name === "AbortError") return;
        setStatus("error");
      }
    })();

    return () => controller.abort();
  }, [selected, tvId, retryKey]);

  return (
    <div>
      <div role="tablist" aria-label="Seasons" className="rail gap-2 pb-2">
        {seasons.map((item) => {
          const active = item.seasonNumber === selected;
          return (
            <button
              key={item.seasonNumber}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setSelected(item.seasonNumber)}
              className={`rail-item rounded-card border px-5 py-2.5 text-sm whitespace-nowrap transition duration-200 ${
                active
                  ? "border-fg bg-fg text-ink"
                  : "border-line-strong text-fg-2 hover:border-fg-3 hover:bg-raised hover:text-fg"
              }`}
            >
              {item.name}
              <span
                className={`ml-2.5 font-mono text-[11px] tabular-nums ${
                  active ? "text-ink/60" : "text-fg-3"
                }`}
              >
                {item.episodeCount}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-10">
        {status === "loading" && <EpisodeListSkeleton />}

        {status === "error" && (
          <div className="rounded-card border border-line bg-surface/50 px-6 py-10">
            <p className="text-sm text-fg">This season could not be loaded.</p>
            <button
              type="button"
              onClick={() => setRetryKey((n) => n + 1)}
              className="mt-4 inline-flex items-center rounded-card border border-line-strong px-4 py-2 text-sm text-fg transition hover:border-fg-3 hover:bg-raised"
            >
              Try again
            </button>
          </div>
        )}

        {status === "ready" && season && (
          <EpisodeList
            episodes={season.episodes}
            tvId={tvId}
            resumeAt={resumeAt}
          />
        )}
      </div>
    </div>
  );
}
