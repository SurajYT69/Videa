import { MediaCard } from "./MediaCard";
import type { MediaItem } from "@/lib/types";

/**
 * Horizontal poster rail. Bleeds to the viewport edge so the row reads as
 * continuing past the fold instead of stopping at a gutter.
 */
export function PosterRail({ items }: { items: MediaItem[] }) {
  return (
    <div className="rail rail-gutter gap-4 pb-2">
      {items.map((item) => (
        <div
          key={`${item.type}-${item.tmdbId}`}
          className="rail-item w-[136px] md:w-[168px]"
        >
          <MediaCard media={item} sizes="168px" />
        </div>
      ))}
    </div>
  );
}
