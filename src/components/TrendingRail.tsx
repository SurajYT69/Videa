import Image from "next/image";
import Link from "next/link";
import { Play } from "@phosphor-icons/react/dist/ssr";
import { Rail } from "./Rail";
import { BACKDROP, tmdbImage } from "@/lib/images";
import { ratingLabel, typeLabel, year } from "@/lib/format";
import { detailsHref } from "@/lib/playback";
import type { MediaItem } from "@/lib/types";

/**
 * Landscape stills, deliberately unlike the poster rails. The title sits on
 * the artwork rather than beneath it, which reads as a frame from the film.
 *
 * Each card carries its rank. Trending is an ordered list and saying so is
 * what separates this section from "some more things we have".
 */
export function TrendingRail({
  items,
  label = "Trending",
}: {
  items: MediaItem[];
  label?: string;
}) {
  return (
    <Rail label={label}>
      {items.map((item, index) => {
        const src = tmdbImage(item.backdropPath, BACKDROP.md);
        const rating = ratingLabel(item.rating);
        return (
          <Link
            key={`${item.type}-${item.tmdbId}`}
            href={detailsHref(item.type, item.tmdbId)}
            className="rail-item group relative aspect-video w-[280px] overflow-hidden rounded-card bg-surface transition-transform duration-300 ease-out-expo hover:-translate-y-1 sm:w-[360px] lg:w-[420px]"
          >
            {src ? (
              <Image
                src={src}
                alt=""
                fill
                /* Measured card width: 280px phone, 360px sm, 420px lg. */
                sizes="(min-width: 1024px) 420px, (min-width: 640px) 360px, 280px"
                /*
                 * No priority. The rail sits below the fold on every viewport
                 * we support, and two eager stills here were competing with the
                 * hero backdrop for the optimizer and for Chrome's six
                 * connections.
                 */
                className="object-cover transition-transform duration-700 ease-out-expo group-hover:scale-[1.06]"
              />
            ) : (
              <div className="absolute inset-0 grid place-items-center">
                <span className="font-mono text-2xl text-fg-3">
                  {item.title.charAt(0).toUpperCase()}
                </span>
              </div>
            )}

            <div className="scrim-media absolute inset-x-0 bottom-0 h-3/5 opacity-90 transition-opacity duration-300 group-hover:opacity-100" />

            {/* Rank. Quiet chip so it marks position without competing. */}
            <span
              aria-hidden="true"
              className="absolute top-3 left-3 rounded-mini bg-black/45 px-2 py-1 font-mono text-[11px] font-medium text-white/90 tabular-nums backdrop-blur-sm"
            >
              {String(index + 1).padStart(2, "0")}
            </span>

            <span className="pointer-events-none absolute top-3 right-3 grid size-10 scale-90 place-items-center rounded-full bg-fg text-ink opacity-0 transition duration-300 ease-out-expo group-hover:scale-100 group-hover:opacity-100">
              <Play weight="fill" className="size-4 translate-x-px" aria-hidden="true" />
            </span>

            {/* Written out rather than reusing `.meta`, whose colour is tuned
                for the page ground, not for sitting on artwork. */}
            <div className="absolute inset-x-0 bottom-0 p-4 md:p-5">
              <h3 className="display line-clamp-1 text-lg text-white md:text-xl">
                {item.title}
              </h3>
              <div className="mt-2 flex items-center gap-2.5 font-mono text-[11px] tracking-[0.06em] uppercase">
                <span className="text-white/70">{typeLabel(item.type)}</span>
                {year(item.releaseDate) && (
                  <>
                    <span aria-hidden="true" className="size-[3px] rounded-full bg-white/40" />
                    <span className="text-white/70 tabular-nums">
                      {year(item.releaseDate)}
                    </span>
                  </>
                )}
                {rating && (
                  <>
                    <span aria-hidden="true" className="size-[3px] rounded-full bg-white/40" />
                    <span className="text-g1 tabular-nums">★ {rating}</span>
                  </>
                )}
              </div>
            </div>

            <div className="pointer-events-none absolute inset-0 rounded-card art-edge" />
          </Link>
        );
      })}
    </Rail>
  );
}
