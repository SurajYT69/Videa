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
 */
export function ContinueWatchingCard({ item }: { item: ContinueWatchingItem }) {
  const src =
    tmdbImage(item.backdropPath, BACKDROP.md) ??
    tmdbImage(item.posterPath, POSTER.lg);

  const line =
    item.type === "tv" && item.season && item.episode
      ? episodeCode(item.season, item.episode)
      : typeLabel(item.type);

  return (
    <div className="group relative">
      <Link
        href={watchHref(item.type, item.tmdbId, item.season, item.episode)}
        className="block rounded-card"
      >
        <div className="relative aspect-video overflow-hidden rounded-card bg-surface">
          {src ? (
            <Image
              src={src}
              alt=""
              fill
              sizes="340px"
              className="object-cover transition-transform duration-700 ease-out-expo group-hover:scale-[1.04]"
            />
          ) : (
            <div className="absolute inset-0 grid place-items-center">
              <span className="font-mono text-xl text-fg-3">
                {item.title.charAt(0).toUpperCase()}
              </span>
            </div>
          )}

          <div className="scrim-media pointer-events-none absolute inset-x-0 bottom-0 h-1/2 opacity-70 transition-opacity duration-300 group-hover:opacity-100" />

          <span className="pointer-events-none absolute inset-0 grid place-items-center">
            <span className="grid size-12 scale-90 place-items-center rounded-full bg-white text-fg opacity-0 transition duration-300 ease-out-expo group-hover:scale-100 group-hover:opacity-100">
              <Play weight="fill" className="size-5" aria-hidden="true" />
            </span>
          </span>

          {item.progress !== null && (
            <div
              className="absolute inset-x-0 bottom-0 h-1 bg-black/25"
              role="progressbar"
              aria-label={`${item.title} progress`}
              aria-valuenow={Math.round(item.progress * 100)}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className="brand-bar h-full"
                style={{ width: `${Math.round(item.progress * 100)}%` }}
              />
            </div>
          )}

          <div className="pointer-events-none absolute inset-0 rounded-card art-edge" />
        </div>

        <h3 className="mt-3 line-clamp-1 text-sm text-fg">{item.title}</h3>
        <p className="meta mt-1">{line}</p>
      </Link>

      <button
        type="button"
        onClick={() => removeFromContinueWatching(item.type, item.tmdbId)}
        className="absolute top-2.5 right-2.5 grid size-8 place-items-center rounded-full bg-ink/70 text-fg-2 opacity-0 backdrop-blur-sm transition duration-200 group-hover:opacity-100 hover:text-fg focus-visible:opacity-100"
      >
        <X className="size-3.5" aria-hidden="true" />
        <span className="sr-only">Remove {item.title} from Continue Watching</span>
      </button>
    </div>
  );
}
