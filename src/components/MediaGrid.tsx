import { MediaCard } from "./MediaCard";
import type { MediaItem } from "@/lib/types";

const GRID_SIZES =
  "(min-width: 1280px) 15vw, (min-width: 1024px) 18vw, (min-width: 768px) 23vw, 44vw";

type Props = {
  items: MediaItem[];
  /** First N posters load eagerly; they are usually above the fold. */
  priorityCount?: number;
};

/** Dense poster grid. 2 columns on mobile, 6 at the widest breakpoint. */
export function MediaGrid({ items, priorityCount = 0 }: Props) {
  return (
    <ul className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
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
