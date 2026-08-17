import { MediaCard } from "./MediaCard";
import { Rail } from "./Rail";
import type { MediaItem } from "@/lib/types";

/**
 * Horizontal poster rail. Bleeds to the viewport edge so the row reads as
 * continuing past the fold instead of stopping at a gutter.
 *
 * Card widths are chosen so the next card is always partly in frame: about
 * 2.1 cards at 390px and 6.6 at 1440px, which is what makes the rail legible
 * as a rail rather than as a short row.
 */
export function PosterRail({
  items,
  label,
}: {
  items: MediaItem[];
  label: string;
}) {
  return (
    <Rail label={label}>
      {items.map((item) => (
        <div
          key={`${item.type}-${item.tmdbId}`}
          className="rail-item w-[148px] md:w-[184px]"
        >
          {/* Measured: 148px card on phones, 184px from md up. */}
          <MediaCard media={item} sizes="(min-width: 768px) 184px, 148px" />
        </div>
      ))}
    </Rail>
  );
}
