import Image from "next/image";
import Link from "next/link";
import { Play } from "@phosphor-icons/react/dist/ssr";
import { Rating } from "./Rating";
import { BACKDROP, tmdbImage } from "@/lib/images";
import { typeLabel, year } from "@/lib/format";
import { detailsHref, watchHref } from "@/lib/playback";
import type { MediaItem } from "@/lib/types";

/**
 * The composition is anchored bottom-left.
 *
 * The wash is a single radial anchored at that corner, not crossed linear
 * scrims: on a light ground two linear scrims bleach the whole still, and a
 * bottom-anchored linear band cuts a visible edge across it. A radial gives
 * density under the type and a clear subject with no seam.
 */
export function Hero({ media }: { media: MediaItem }) {
  const src = tmdbImage(media.backdropPath, BACKDROP.lg);
  const released = year(media.releaseDate);

  return (
    <section className="relative isolate flex min-h-[600px] items-end overflow-hidden md:min-h-[84dvh]">
      {src && (
        <Image
          src={src}
          alt=""
          fill
          priority
          sizes="100vw"
          className="-z-10 object-cover object-[70%_center]"
        />
      )}

      {/* Opaque under the type, clear across the subject. */}
      <div className="scrim-corner absolute inset-0 -z-10" />
      {/* Short band so the still hands off cleanly to the section below. */}
      <div className="scrim-bottom absolute inset-x-0 bottom-0 -z-10 h-1/4" />

      {/* Brand colour rides the seam where the still meets the layout. */}
      <div
        aria-hidden="true"
        className="brand-wash pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-1/4 rotate-180 opacity-40"
      />

      <div className="page w-full pt-24 pb-14 md:pb-20">
        <div className="max-w-xl">
          <h1
            className="display animate-rise text-4xl text-fg text-balance md:text-6xl lg:text-[4.25rem]"
            style={{ animationDelay: "60ms" }}
          >
            {media.title}
          </h1>

          <div
            className="animate-rise mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs"
            style={{ animationDelay: "140ms" }}
          >
            <Rating value={media.rating} />
            <span className="meta">{typeLabel(media.type)}</span>
            {released && <span className="meta">{released}</span>}
            {media.genres.length > 0 && (
              <span className="meta hidden sm:inline">
                {media.genres.slice(0, 2).join("  ·  ")}
              </span>
            )}
          </div>

          {media.overview && (
            <p
              className="animate-rise mt-5 line-clamp-3 max-w-[54ch] text-sm leading-relaxed text-fg-2 md:text-base"
              style={{ animationDelay: "200ms" }}
            >
              {media.overview}
            </p>
          )}

          <div
            className="animate-rise mt-8 flex flex-wrap items-center gap-3"
            style={{ animationDelay: "260ms" }}
          >
            <Link
              href={watchHref(media.type, media.tmdbId, 1, 1)}
              className="inline-flex items-center gap-2.5 rounded-card bg-fg px-6 py-3.5 text-sm font-medium whitespace-nowrap text-ink transition duration-200 hover:-translate-y-px hover:shadow-lift active:translate-y-0 active:shadow-soft"
            >
              <Play weight="fill" className="size-4" aria-hidden="true" />
              Watch now
            </Link>
            <Link
              href={detailsHref(media.type, media.tmdbId)}
              className="inline-flex items-center rounded-card border border-line-strong bg-raised/80 px-6 py-3.5 text-sm font-medium whitespace-nowrap text-fg backdrop-blur-sm transition duration-200 hover:border-fg-3 hover:bg-raised active:translate-y-px"
            >
              Details
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
