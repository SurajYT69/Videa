import Image from "next/image";
import Link from "next/link";
import { BACKDROP, tmdbImage } from "@/lib/images";
import { metaLine, typeLabel, year } from "@/lib/format";
import { detailsHref } from "@/lib/playback";
import type { MediaItem } from "@/lib/types";

/**
 * Landscape treatment, deliberately unlike the poster rails. Title sits on
 * the artwork rather than beneath it, which reads as a still from the film.
 */
export function TrendingRail({ items }: { items: MediaItem[] }) {
  return (
    <div className="rail rail-gutter gap-4 pb-2">
      {items.map((item) => {
        const src = tmdbImage(item.backdropPath, BACKDROP.md);
        return (
          <Link
            key={`${item.type}-${item.tmdbId}`}
            href={detailsHref(item.type, item.tmdbId)}
            className="rail-item group relative aspect-video w-[268px] overflow-hidden rounded-card bg-surface md:w-[380px]"
          >
            {src ? (
              <Image
                src={src}
                alt=""
                fill
                sizes="380px"
                className="object-cover transition-transform duration-700 ease-out-expo group-hover:scale-[1.05]"
              />
            ) : (
              <div className="absolute inset-0 grid place-items-center">
                <span className="font-mono text-2xl text-fg-3">
                  {item.title.charAt(0).toUpperCase()}
                </span>
              </div>
            )}

            <div className="scrim-media absolute inset-x-0 bottom-0 h-3/5 opacity-90 transition-opacity duration-300 group-hover:opacity-100" />

            {/* Written out rather than reusing `.meta`, whose colour is tuned
                for the page ground, not for sitting on artwork. */}
            <div className="absolute inset-x-0 bottom-0 p-4">
              <h3 className="display line-clamp-1 text-base text-white md:text-lg">
                {item.title}
              </h3>
              <div className="mt-1.5 flex items-baseline gap-3 text-[11px]">
                <span className="font-mono text-[11px] tracking-[0.06em] text-white/70 uppercase">
                  {metaLine(year(item.releaseDate), typeLabel(item.type))}
                </span>
                <span className="font-mono text-[11px] text-g1 tabular-nums">
                  {item.rating > 0 ? item.rating.toFixed(1) : ""}
                </span>
              </div>
            </div>

            <div className="pointer-events-none absolute inset-0 rounded-card art-edge" />
          </Link>
        );
      })}
    </div>
  );
}
