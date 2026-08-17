import Image from "next/image";
import Link from "next/link";
import { Info, Play } from "@phosphor-icons/react/dist/ssr";
import { BACKDROP, tmdbImage } from "@/lib/images";
import { ratingLabel, typeLabel, year } from "@/lib/format";
import { detailsHref, watchHref } from "@/lib/playback";
import type { MediaItem } from "@/lib/types";

/**
 * The composition is anchored bottom-left.
 *
 * The wash is a single radial anchored at that corner, not crossed linear
 * scrims: on a light ground two linear scrims bleach the whole still, and a
 * bottom-anchored linear band cuts a visible edge across it. A radial gives
 * density under the type and a clear subject with no seam.
 *
 * Height is capped rather than tied to the viewport, for two reasons. The first
 * rail stays reachable on a laptop, and — more importantly — a 16:9 backdrop in
 * a very tall box has to throw away most of its width to fill, which is what
 * slices through the actors. A shallower box keeps the frame close to the
 * still's own proportions.
 */
export function Hero({ media, eyebrow = "Trending now" }: { media: MediaItem; eyebrow?: string }) {
  const src = tmdbImage(media.backdropPath, BACKDROP.lg);
  const released = year(media.releaseDate);
  const rating = ratingLabel(media.rating);

  /* One mono strip. Data reads as data; the title carries the voice. */
  const facts = [
    typeLabel(media.type),
    released,
    media.genres.slice(0, 2).join(", ") || null,
  ].filter(Boolean) as string[];

  return (
    <section className="relative isolate flex min-h-[520px] items-end overflow-hidden sm:min-h-[560px] md:min-h-[clamp(600px,64dvh,700px)]">
      {src && (
        <Image
          src={src}
          alt=""
          fill
          priority
          fetchPriority="high"
          sizes="100vw"
          /*
           * Two crops, not one. Wide frames bias right so the subject clears
           * the type column on the left; narrow frames centre horizontally,
           * because at 390px there is no far side to move the subject to. Both
           * sit high in the frame, since backdrops put faces in the upper
           * third and a centred crop cuts them at the chin.
           */
          className="-z-10 object-cover object-[50%_26%] md:object-[64%_28%]"
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

      <div className="page w-full pt-32 pb-16 md:pb-24">
        <div className="max-w-[46rem]">
          <div
            className="animate-rise flex items-center gap-3"
            style={{ animationDelay: "40ms" }}
          >
            <span className="h-px w-8 bg-fg-3/50" />
            <span className="eyebrow">{eyebrow}</span>
          </div>

          <h1
            className="display display-hero animate-rise mt-5 max-w-[16ch] text-fg text-balance"
            style={{ animationDelay: "90ms" }}
          >
            {media.title}
          </h1>

          <div
            className="animate-rise mt-6 flex flex-wrap items-center gap-x-3 gap-y-2"
            style={{ animationDelay: "150ms" }}
          >
            {rating && (
              <span className="inline-flex items-center gap-1.5 rounded-mini bg-accent-soft px-2 py-1 font-mono text-[11px] font-medium text-accent tabular-nums">
                <span aria-hidden="true">★</span>
                {rating}
                <span className="sr-only">out of 10</span>
              </span>
            )}
            {facts.map((fact, index) => (
              <span key={fact} className="flex items-center gap-3">
                {index > 0 && (
                  <span aria-hidden="true" className="size-[3px] rounded-full bg-fg-3/50" />
                )}
                <span className="meta">{fact}</span>
              </span>
            ))}
          </div>

          {media.overview && (
            <p
              className="animate-rise mt-6 line-clamp-2 max-w-[56ch] text-[15px] leading-relaxed text-fg-2 md:line-clamp-3 md:text-base"
              style={{ animationDelay: "210ms" }}
            >
              {media.overview}
            </p>
          )}

          <div
            className="animate-rise mt-9 flex flex-wrap items-center gap-3"
            style={{ animationDelay: "270ms" }}
          >
            <Link
              href={watchHref(media.type, media.tmdbId, 1, 1)}
              className="inline-flex items-center gap-2.5 rounded-card bg-fg px-7 py-4 text-[15px] font-medium whitespace-nowrap text-ink transition duration-200 hover:-translate-y-px hover:shadow-lift active:translate-y-0 active:shadow-soft"
            >
              <Play weight="fill" className="size-4" aria-hidden="true" />
              Watch now
            </Link>
            <Link
              href={detailsHref(media.type, media.tmdbId)}
              className="inline-flex items-center gap-2.5 rounded-card border border-line-strong bg-raised/70 px-7 py-4 text-[15px] font-medium whitespace-nowrap text-fg backdrop-blur-sm transition duration-200 hover:border-fg-3 hover:bg-raised active:translate-y-px"
            >
              <Info className="size-4" aria-hidden="true" />
              Details
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
