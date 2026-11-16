import Image from "next/image";
import Link from "next/link";
import { Info, Play } from "@phosphor-icons/react/dist/ssr";
import { AmbientTint } from "./AmbientTint";
import { Score } from "./Rating";
import { BACKDROP, tmdbImage } from "@/lib/images";
import { typeLabel, year } from "@/lib/format";
import { detailsHref, watchHref } from "@/lib/playback";
import type { MediaItem } from "@/lib/types";

/**
 * The composition is anchored bottom-left.
 *
 * The wash is a single radial anchored at that corner, not crossed linear
 * scrims: a radial gives density under the type and a clear subject with no
 * seam.
 *
 * Height is capped rather than tied to the viewport, for two reasons. The first
 * rail stays reachable on a laptop, and — more importantly — a 16:9 backdrop in
 * a very tall box has to throw away most of its width to fill, which is what
 * slices through the actors. A shallower box keeps the frame close to the
 * still's own proportions.
 *
 * On desktop the section breaks out under the icon rail (`md:-ml-18`) and pads
 * its content back in, so the still runs edge to edge.
 */
export function Hero({
  media,
  eyebrow = "Trending now",
  priority = true,
}: {
  media: MediaItem;
  eyebrow?: string;
  /** Only the first slide of the carousel is the LCP element. */
  priority?: boolean;
}) {
  const src = tmdbImage(media.backdropPath, BACKDROP.xl);

  const facts = [
    typeLabel(media.type),
    year(media.releaseDate),
    media.genres.slice(0, 2).join(" & ") || null,
  ].filter(Boolean) as string[];
  const hasScore = media.rating > 0;

  return (
    <section className="relative isolate flex items-end overflow-hidden md:-ml-18 md:min-h-[clamp(600px,min(88dvh,56.25vw),960px)]">
      {src && (
        <div className="absolute inset-x-0 top-0 -z-10 aspect-video md:inset-0 md:aspect-auto">
          {/* Phones show the whole 16:9 still across the top instead of
              covering a portrait box, which zoomed a wide frame until only a
              sliver of the middle was left. From md up it fills the hero. */}
        <Image
          src={src}
          alt=""
          fill
          priority={priority}
          fetchPriority={priority ? "high" : "auto"}
          sizes="100vw"
          /* Heroes only: 75 bands the dark gradients of a full-screen still. */
          quality={90}
          data-ambient={priority ? true : undefined}
          data-hero-art
          /* Wide frames bias right so the subject clears the type column,
             and sit high because backdrops put faces in the upper third. */
          className="object-cover md:object-[64%_28%]"
        />
          {/* Phones only: the still ends here, so it fades into the ground. */}
          <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-ink to-transparent md:hidden" />
        </div>
      )}
      {priority && <AmbientTint />}

      {/* Opaque under the type, clear across the subject. */}
      <div className="scrim-corner absolute inset-0 -z-10" />
      {/* Bright stills (much of anime) need a little more density under the
          type column; this is weighted to the left, not a flat tint. */}
      <div className="scrim-left absolute inset-y-0 left-0 -z-10 hidden w-3/5 opacity-60 md:block" />
      {/* Short band so the still hands off cleanly to the section below. */}
      <div className="scrim-bottom absolute inset-x-0 bottom-0 -z-10 h-1/4" />

      <div className="w-full md:pl-18">
        <div className="page pt-[calc(56.25vw-1rem)] pb-12 md:pt-32 md:pb-16">
          <div data-hero-copy className="max-w-[40rem]">
            <p className="eyebrow animate-rise" style={{ animationDelay: "40ms" }}>
              {eyebrow}
            </p>

            <h1
              className="display display-hero animate-rise mt-4 max-w-[16ch] text-fg text-balance"
              style={{ animationDelay: "90ms" }}
            >
              {media.title}
            </h1>

            <div
              className="animate-rise mt-6 flex flex-wrap items-center gap-x-4 gap-y-2"
              style={{ animationDelay: "150ms" }}
            >
              <Score value={media.rating} />
              {facts.map((fact, index) => (
                <span key={fact} className="flex items-center gap-4">
                  {(index > 0 || hasScore) && (
                    <span aria-hidden="true" className="hidden h-3 w-px bg-fg-3/40 sm:block" />
                  )}
                  <span className="text-sm text-fg-2">{fact}</span>
                </span>
              ))}
            </div>

            {media.overview && (
              <p
                className="animate-rise mt-5 line-clamp-2 max-w-[56ch] text-[15px] leading-relaxed text-fg-2 md:line-clamp-3 md:text-base"
                style={{ animationDelay: "210ms" }}
              >
                {media.overview}
              </p>
            )}

            <div
              className="animate-rise mt-8 flex items-center gap-3"
              style={{ animationDelay: "270ms" }}
            >
              <Link
                href={watchHref(media.type, media.tmdbId, 1, 1)}
                className="inline-flex items-center gap-2 rounded-full bg-fg px-5 py-3.5 text-[15px] font-medium sm:px-7 sm:py-4 sm:text-base whitespace-nowrap text-ink transition duration-200 hover:-translate-y-px hover:shadow-lift active:translate-y-0 active:shadow-soft"
              >
                <Play weight="fill" className="size-4" aria-hidden="true" />
                Watch now
              </Link>
              <Link
                href={detailsHref(media.type, media.tmdbId)}
                className="inline-flex items-center gap-2 glass rounded-full px-5 py-3.5 text-[15px] font-medium sm:px-7 sm:py-4 sm:text-base whitespace-nowrap text-fg transition duration-200 hover:bg-fg/10 active:translate-y-px"
              >
                <Info className="size-4" aria-hidden="true" />
                More info
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
