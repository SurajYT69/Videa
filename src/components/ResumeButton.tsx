"use client";

import Link from "next/link";
import { Play } from "@phosphor-icons/react";
import { episodeCode } from "@/lib/format";
import { watchHref } from "@/lib/playback";
import { getLastEpisode } from "@/lib/storage";
import { useLibrary } from "@/lib/useLibrary";

type Props = {
  tvId: number;
  /** Where to start when there is no history. */
  startSeason: number;
  startEpisode: number;
};

/** Reads as "Start watching" until there is something to resume. */
export function ResumeButton({ tvId, startSeason, startEpisode }: Props) {
  const library = useLibrary();
  const last = getLastEpisode(library, tvId);

  const season = last?.season ?? startSeason;
  const episode = last?.episode ?? startEpisode;

  return (
    <Link
      href={watchHref("tv", tvId, season, episode)}
      className="inline-flex items-center gap-2.5 rounded-card bg-fg px-8 py-4 text-base font-medium whitespace-nowrap text-ink transition duration-200 hover:-translate-y-px hover:shadow-lift active:translate-y-0 active:shadow-soft"
    >
      <Play weight="fill" className="size-4" aria-hidden="true" />
      {last ? "Resume" : "Start watching"}
      <span className="font-mono text-xs text-ink/60">
        {episodeCode(season, episode)}
      </span>
    </Link>
  );
}
