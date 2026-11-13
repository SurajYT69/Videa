"use client";

import Image from "next/image";
import Link from "next/link";
import { Play } from "@phosphor-icons/react";
import { BACKDROP, tmdbImage } from "@/lib/images";
import { watchHref } from "@/lib/playback";
import { getLastEpisode } from "@/lib/storage";
import { useLibrary } from "@/lib/useLibrary";

type Props = {
  tvId: number;
  backdropPath: string | null;
};

/**
 * "Continue watching", on the series hero. It only exists once this browser
 * has a last episode for the show, and it only draws progress the player
 * actually reported; with none, there is no bar and no percentage.
 */
export function ResumeCard({ tvId, backdropPath }: Props) {
  const library = useLibrary();
  const last = getLastEpisode(library, tvId);
  if (!last) return null;

  const entry = library.continueWatching.find(
    (item) => item.type === "tv" && item.tmdbId === tvId,
  );
  const percent =
    entry && entry.progress !== null ? Math.round(entry.progress * 100) : null;
  const src = tmdbImage(backdropPath, BACKDROP.md);

  return (
    <Link
      href={watchHref("tv", tvId, last.season, last.episode)}
      className="glass-panel group flex items-center gap-4 rounded-card p-3"
    >
      <span className="relative block aspect-video w-36 shrink-0 overflow-hidden rounded-mini bg-surface">
        {src && (
          <Image src={src} alt="" fill sizes="144px" className="object-cover" />
        )}
        <span className="absolute inset-0 grid place-items-center">
          <span className="grid size-9 place-items-center rounded-full bg-black/45 text-white backdrop-blur-md transition-colors duration-200 group-hover:bg-fg group-hover:text-ink">
            <Play weight="fill" className="size-4 translate-x-px" aria-hidden="true" />
          </span>
        </span>
        {percent !== null && (
          <span className="absolute inset-x-2 bottom-2 h-1 overflow-hidden rounded-full bg-white/25">
            <span className="block h-full bg-accent" style={{ width: `${percent}%` }} />
          </span>
        )}
      </span>

      <span className="min-w-0 flex-1">
        <span className="inline-block rounded-mini bg-accent-soft px-2 py-1 font-mono text-[11px] font-medium tracking-[0.12em] text-accent uppercase">
          Continue watching
        </span>
        <span className="display mt-2 block text-lg text-fg">
          S{last.season} E{last.episode}
        </span>
        {percent !== null && (
          <span className="meta mt-1 block tabular-nums">{percent}% watched</span>
        )}
      </span>
    </Link>
  );
}
