import Link from "next/link";
import { Play } from "@phosphor-icons/react/dist/ssr";
import { Poster } from "./Poster";
import { Rail } from "./Rail";
import { detailsHref } from "@/lib/playback";
import type { MediaItem } from "@/lib/types";

/**
 * Ranked poster rail: a hollow numeral behind each poster's left edge. The
 * poster sits on top of the numeral's right side, so the rank reads as part of
 * the card rather than a label stuck on it. Posters keep the rail-poster
 * widths (148 / 184) so the measured `sizes` still hold.
 */
export function Top10Rail({ items, label }: { items: MediaItem[]; label: string }) {
  return (
    <Rail label={label}>
      {items.slice(0, 10).map((item, index) => (
        <Link
          key={`${item.type}-${item.tmdbId}`}
          href={detailsHref(item.type, item.tmdbId)}
          aria-label={`${index + 1}. ${item.title}`}
          className="rail-item group flex items-end rounded-card focus-visible:outline-offset-4"
        >
          <span
            aria-hidden="true"
            className="top10-numeral display -mr-5 select-none text-[140px] leading-[0.75] tabular-nums md:-mr-7 md:text-[200px]"
          >
            {index + 1}
          </span>
          <div className="relative aspect-2/3 w-[148px] shrink-0 overflow-hidden rounded-card bg-surface transition-shadow duration-200 ease-out-expo group-hover:shadow-lift md:w-[184px]">
            {/* Measured: 148px on phones, 184px from md up. */}
            <Poster path={item.posterPath} title={item.title} sizes="(min-width: 768px) 184px, 148px" />
            <span className="pointer-events-none absolute right-2 bottom-2 grid size-10 translate-y-1.5 place-items-center rounded-full bg-fg text-ink opacity-0 shadow-soft transition-[opacity,translate] duration-200 ease-out-expo group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
              <Play weight="fill" className="size-4 translate-x-px" aria-hidden="true" />
            </span>
            <div className="pointer-events-none absolute inset-0 rounded-card art-edge" />
          </div>
        </Link>
      ))}
    </Rail>
  );
}
