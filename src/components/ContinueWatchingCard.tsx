"use client";

import Image from "next/image";
import Link from "next/link";
import { Play, X } from "@phosphor-icons/react";
import { BACKDROP, POSTER, tmdbImage } from "@/lib/images";
import { episodeCode, typeLabel } from "@/lib/format";
import { watchHref } from "@/lib/playback";
import { removeFromContinueWatching } from "@/lib/storage";
import type { ContinueWatchingItem } from "@/lib/types";

/**
 * Wide landscape treatment. Progress is a hairline at the base of the frame:
 * present enough to read at a glance, quiet enough not to compete with the art.
 *
 * Progress is only ever drawn when the player actually reported a position.
 * An entry with `progress: null` renders no bar rather than a plausible-looking
 * guess.
 */
export function ContinueWatchingCard({ item }: { item: ContinueWatchingItem }) {
  const src =
    tmdbImage(item.backdropPath, BACKDROP.md) ??
    tmdbImage(item.posterPath, POSTER.lg);

  const line =
    item.type === "tv" && item.season && item.episode
      ? episodeCode(item.season, item.episode)
      : typeLabel(item.type);

  const percent =
    item.progress !== null ? Math.round(item.progress * 100) : null;

  return (
    <div className="group relative">
      <Link
        href={watchHref(item.type, item.tmdbId, item.season, item.episode)}
        className="block rounded-card"
      >
        <div className="relative aspect-video overflow-hidden rounded-card bg-surface transition-shadow duration-200 ease-out-expo group-hover:shadow-lift">
          {src ? (
            <Image
              src={src}
              alt=""
              fill
              sizes="(min-width: 768px) 360px, 280px"
              className="object-cover"
            />
          ) : (
            <div className="absolute inset-0 grid place-items-center">
              <span className="font-mono text-xl text-fg-3">
                {item.title.charAt(0).toUpperCase()}
              </span>
            </div>
          )}

          <div className="scrim-media pointer-events-none absolute inset-x-0 bottom-0 h-1/2 opacity-70 transition-opacity duration-200 ease-out-expo group-hover:opacity-100" />

          <span className="pointer-events-none absolute inset-0 grid place-items-center">
            <span className="grid size-14 scale-95 place-items-center rounded-full bg-fg text-ink opacity-0 shadow-lift transition-[opacity,transform] duration-200 ease-out-expo group-hover:scale-100 group-hover:opacity-100 group-has-[a:focus-visible]:scale-100 group-has-[a:focus-visible]:opacity-100">
              <Play weight="fill" className="size-5 translate-x-px" aria-hidden="true" />
            </span>
          </span>

          {percent !== null && (
            <div className="absolute inset-x-0 bottom-0">
              <p className="px-3 pb-2 text-right font-mono text-xs text-white/80 tabular-nums">
                {percent}%
              </p>
              <div
                className="h-1 bg-black/30"
                role="progressbar"
                aria-label={`${item.title} progress`}
                aria-valuenow={percent}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div className="h-full bg-accent" style={{ width: `${percent}%` }} />
              </div>
            </div>
          )}

          <div className="pointer-events-none absolute inset-0 rounded-card art-edge" />
        </div>

        <h3 className="mt-3 line-clamp-1 text-sm font-medium text-fg">
          {item.title}
        </h3>
        <p className="meta mt-1.5">{line}</p>
      </Link>

      <button
        type="button"
        onClick={() => removeFromContinueWatching(item.type, item.tmdbId)}
        title="Remove"
        /*
         * Styled like the poster panel's save button: a control on artwork,
         * white over a dark film in both themes. Hidden until hover only where
         * hover exists; on touch it stays visible, because an invisible button
         * over the corner of the still would remove a title on a stray tap.
         */
        className="absolute top-2 right-2 grid size-9 place-items-center rounded-full border border-white/40 bg-black/40 text-white backdrop-blur-md transition-[opacity,transform,border-color] duration-150 ease-out-expo hover:border-white active:scale-[0.96] pointer-fine:opacity-0 pointer-fine:group-hover:opacity-100 pointer-fine:group-focus-within:opacity-100"
      >
        <X weight="bold" className="size-3.5" aria-hidden="true" />
        <span className="sr-only">Remove {item.title} from Continue Watching</span>
      </button>
    </div>
  );
}
