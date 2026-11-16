"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
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
  /** The show's backdrop, for episodes TMDB has no still for. */
  fallbackPath?: string | null;
};

type Status = "ready" | "loading" | "error";

export function SeasonSelector({ tvId, seasons, initialSeason, fallbackPath }: Props) {
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

  const current = seasons.find((item) => item.seasonNumber === selected);
  const currentYear = current?.airDate?.slice(0, 4);
  const count = season?.seasonNumber === selected ? season.episodes.length : current?.episodeCount;

  /* Tabs move with the arrow keys and only the selected one is in the tab
     order, which is what a tablist promises to keyboard and screen reader
     users. */
  const tabs = useRef<Array<HTMLButtonElement | null>>([]);
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const index = seasons.findIndex((item) => item.seasonNumber === selected);
    const last = seasons.length - 1;
    const next =
      event.key === "ArrowRight" ? Math.min(index + 1, last)
      : event.key === "ArrowLeft" ? Math.max(index - 1, 0)
      : event.key === "Home" ? 0
      : event.key === "End" ? last
      : null;
    if (next === null || next === index) return;
    event.preventDefault();
    setSelected(seasons[next]?.seasonNumber ?? selected);
    tabs.current[next]?.focus();
  };

  return (
    <div>
      <div className="page">
        <div
          role="tablist"
          aria-label="Seasons"
          onKeyDown={onKeyDown}
          className="rail gap-2 pb-2"
        >
          {seasons.map((item, index) => {
            const active = item.seasonNumber === selected;
            const resumeHere = resumeAt?.season === item.seasonNumber;
            return (
              <button
                key={item.seasonNumber}
                ref={(node) => {
                  tabs.current[index] = node;
                }}
                type="button"
                role="tab"
                aria-selected={active}
                tabIndex={active ? 0 : -1}
                onClick={() => setSelected(item.seasonNumber)}
                className={`rail-item inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-medium whitespace-nowrap transition duration-200 ${
                  active
                    ? "border-fg bg-fg text-ink"
                    : "glass text-fg-2 hover:bg-white/15 hover:text-fg"
                }`}
              >
                {item.name}
                {/* The season the viewer stopped in: "you are here". */}
                {resumeHere && (
                  <>
                    <span aria-hidden="true" className="size-1.5 rounded-full bg-accent" />
                    <span className="sr-only">, continue here</span>
                  </>
                )}
              </button>
            );
          })}
        </div>

        {/* The selected season's data, once, under the tabs, instead of a
            count crowded into every pill. */}
        {Boolean(currentYear || count) && (
          <p className="meta mt-3 tabular-nums">
            {[currentYear, count ? `${count} episode${count === 1 ? "" : "s"}` : null]
              .filter(Boolean)
              .join(" · ")}
          </p>
        )}
      </div>

      <div className="mt-6">
        {status === "loading" && (
          <div className="page">
            <EpisodeListSkeleton />
          </div>
        )}

        {status === "error" && (
          <div className="page">
            <div className="glass rounded-card px-6 py-10">
              <p className="text-sm text-fg">This season could not be loaded.</p>
              <button
                type="button"
                onClick={() => setRetryKey((n) => n + 1)}
                className="mt-4 inline-flex items-center rounded-full border border-line-strong px-5 py-2 text-sm font-medium text-fg transition hover:border-fg-3 hover:bg-raised"
              >
                Try again
              </button>
            </div>
          </div>
        )}

        {status === "ready" && season && (
          <EpisodeList
            episodes={season.episodes}
            tvId={tvId}
            resumeAt={resumeAt}
            fallbackPath={fallbackPath}
          />
        )}
      </div>
    </div>
  );
}
