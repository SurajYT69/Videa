import Link from "next/link";
import { Play } from "@phosphor-icons/react/dist/ssr";
import { Poster } from "./Poster";
import { Rating } from "./Rating";
import { typeLabel, year } from "@/lib/format";
import { detailsHref } from "@/lib/playback";
import type { MediaItem } from "@/lib/types";

type Props = {
  media: MediaItem;
  sizes: string;
  priority?: boolean;
  /** Shown instead of the year for series, when the count is known. */
  seasonCount?: number;
};

/**
 * The poster is the content. Hover lifts the whole card and adds one action
 * affordance; it never covers the artwork with a panel of metadata.
 *
 * The line below the poster is split rather than joined with separators:
 * title, then year on the left and rating on the right. Two anchors read
 * faster at this size than one run-on string.
 */
export function MediaCard({ media, sizes, priority, seasonCount }: Props) {
  const secondary =
    media.type === "tv" && seasonCount
      ? `${seasonCount} Season${seasonCount === 1 ? "" : "s"}`
      : (year(media.releaseDate) ?? typeLabel(media.type));

  return (
    <Link
      href={detailsHref(media.type, media.tmdbId)}
      className="group block rounded-card transition-transform duration-300 ease-out-expo hover:-translate-y-1 focus-visible:outline-offset-4"
    >
      {/* No resting shadow: eighteen of these in a grid reads as fog. */}
      <div className="relative aspect-2/3 overflow-hidden rounded-card bg-surface transition-shadow duration-300 group-hover:shadow-lift">
        <div className="absolute inset-0 transition-transform duration-500 ease-out-expo group-hover:scale-[1.05]">
          <Poster
            path={media.posterPath}
            title={media.title}
            sizes={sizes}
            priority={priority}
          />
        </div>

        <div className="scrim-media pointer-events-none absolute inset-x-0 bottom-0 h-1/2 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        <span className="pointer-events-none absolute right-2.5 bottom-2.5 grid size-9 translate-y-2 place-items-center rounded-full bg-fg text-ink opacity-0 shadow-soft transition duration-300 ease-out-expo group-hover:translate-y-0 group-hover:opacity-100">
          {/* A right-pointing triangle is left-heavy; nudged right to read centred. */}
          <Play weight="fill" className="size-4 translate-x-px" aria-hidden="true" />
        </span>

        <div className="pointer-events-none absolute inset-0 rounded-card art-edge" />
      </div>

      <h3 className="mt-3.5 line-clamp-1 text-sm font-medium text-fg-2 transition-colors duration-200 group-hover:text-fg">
        {media.title}
      </h3>
      <div className="mt-1.5 flex items-baseline justify-between gap-3">
        <span className="meta truncate">{secondary}</span>
        <Rating value={media.rating} variant="bare" />
      </div>
    </Link>
  );
}
