import { MediaCard } from "./MediaCard";
import type { MediaItem } from "@/lib/types";

const GRID_SIZES =
  "(min-width: 1280px) 16vw, (min-width: 1024px) 19vw, (min-width: 768px) 24vw, 45vw";

type Props = {
  items: MediaItem[];
  /** First N posters load eagerly; they are usually above the fold. */
  priorityCount?: number;
};

/** Dense poster grid. 2 columns on mobile, 6 at the widest breakpoint. */
export function MediaGrid({ items, priorityCount = 0 }: Props) {
  return (
    <ul className="grid grid-cols-2 gap-x-4 gap-y-9 sm:grid-cols-3 md:grid-cols-4 md:gap-x-5 lg:grid-cols-5 xl:grid-cols-6">
      {items.map((item, index) => (
        <li key={`${item.type}-${item.tmdbId}`}>
          <MediaCard
            media={item}
            sizes={GRID_SIZES}
            priority={index < priorityCount}
          />
        </li>
      ))}
    </ul>
  );
}
