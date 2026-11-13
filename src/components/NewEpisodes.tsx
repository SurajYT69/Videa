"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Section } from "./Section";
import { Rail } from "./Rail";
import { BACKDROP, tmdbImage } from "@/lib/images";
import { airDateLabel } from "@/lib/format";
import { detailsHref, watchHref } from "@/lib/playback";
import { useLibrary } from "@/lib/useLibrary";
import type { Airing } from "@/lib/types";

/** How far either side of today an episode counts as news. */
const WINDOW_DAYS = 7;
const DAY = 24 * 60 * 60 * 1000;

type Notice = {
  show: Airing;
  label: string;
  season: number;
  episode: number;
  /** Aired already, so it can be played now. */
  out: boolean;
};

/**
 * "New episodes" for the series this browser has saved or started. The list
 * of shows comes from LocalStorage; their air dates come from TMDB through
 * `/api/airing`. Nothing renders until there is something to say.
 */
export function NewEpisodes() {
  const { favorites, continueWatching } = useLibrary();

  const ids = useMemo(() => {
    const all = [...continueWatching, ...favorites]
      .filter((item) => item.type === "tv")
      .map((item) => item.tmdbId);
    /* ponytail: first ten shows only, to cap the request fan-out. */
    return [...new Set(all)].slice(0, 10);
  }, [favorites, continueWatching]);

  const [shows, setShows] = useState<Airing[]>([]);

  useEffect(() => {
    if (!ids.length) return;
    const controller = new AbortController();
    fetch(`/api/airing?ids=${ids.join(",")}`, { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : { shows: [] }))
      .then((data: { shows: Airing[] }) => setShows(data.shows))
      .catch(() => {
        /* Aborted or offline: no notice is the right failure. */
      });
    return () => controller.abort();
  }, [ids]);

  const notices = useMemo(() => {
    const now = Date.now();
    const out: Notice[] = [];
    for (const show of shows) {
      const last = show.lastEpisode;
      const next = show.nextEpisode;
      const lastAt = last?.airDate ? Date.parse(last.airDate) : NaN;
      const nextAt = next?.airDate ? Date.parse(next.airDate) : NaN;

      if (last && now - lastAt >= 0 && now - lastAt <= WINDOW_DAYS * DAY) {
        out.push({ show, season: last.season, episode: last.episode, out: true, label: `Out ${airDateLabel(last.airDate)}` });
      } else if (next && nextAt - now >= 0 && nextAt - now <= WINDOW_DAYS * DAY) {
        out.push({ show, season: next.season, episode: next.episode, out: false, label: `Airs ${airDateLabel(next.airDate)}` });
      }
    }
    return out;
  }, [shows]);

  if (!notices.length) return null;

  return (
    <Section title="New episodes" bleed>
      <Rail label="New episodes">
        {notices.map(({ show, label, season, episode, out }) => {
          const src = tmdbImage(show.backdropPath, BACKDROP.md);
          const href = out
            ? watchHref("tv", show.tmdbId, season, episode)
            : detailsHref("tv", show.tmdbId);
          return (
            <Link
              key={show.tmdbId}
              href={href}
              className="rail-item glass-panel group flex w-[300px] items-center gap-4 rounded-card p-3 md:w-[360px]"
            >
              <span className="relative block aspect-video w-28 shrink-0 overflow-hidden rounded-mini bg-surface md:w-32">
                {src && <Image src={src} alt="" fill sizes="128px" className="object-cover" />}
              </span>
              <span className="min-w-0">
                <span className="eyebrow block text-accent">
                  {out ? "New episode" : "Coming up"}
                </span>
                <span className="mt-1 block truncate text-sm font-medium text-fg">
                  {show.title}
                </span>
                <span className="meta mt-1 block">
                  S{season} E{episode} · {label}
                </span>
              </span>
            </Link>
          );
        })}
      </Rail>
    </Section>
  );
}
