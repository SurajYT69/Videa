import Link from "next/link";
import { Play } from "@phosphor-icons/react/dist/ssr";
import { Poster } from "./Poster";
import { Rating } from "./Rating";
import { metaLine, typeLabel, year } from "@/lib/format";
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
 * The poster is the content. Hover adds a small amount of depth and one
 * action affordance; it never covers the artwork.
 */
export function MediaCard({ media, sizes, priority, seasonCount }: Props) {
  const secondary =
    media.type === "tv" && seasonCount
      ? metaLine(
          `${seasonCount} Season${seasonCount === 1 ? "" : "s"}`,
          typeLabel(media.type),
        )
      : metaLine(year(media.releaseDate), typeLabel(media.type));

  return (
    <Link
      href={detailsHref(media.type, media.tmdbId)}
      className="group block rounded-card focus-visible:outline-offset-4"
    >
      <div className="relative aspect-2/3 overflow-hidden rounded-card bg-surface">
        <div className="absolute inset-0 transition-transform duration-500 ease-out-expo group-hover:scale-[1.04]">
          <Poster
            path={media.posterPath}
            title={media.title}
            sizes={sizes}
            priority={priority}
          />
        </div>

        <div className="scrim-media pointer-events-none absolute inset-x-0 bottom-0 h-2/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        <span className="pointer-events-none absolute right-2.5 bottom-2.5 grid size-9 translate-y-1 place-items-center rounded-full bg-white text-fg opacity-0 transition duration-300 ease-out-expo group-hover:translate-y-0 group-hover:opacity-100">
          <Play weight="fill" className="size-4" aria-hidden="true" />
        </span>

        <div className="pointer-events-none absolute inset-0 rounded-card art-edge" />
      </div>

      <h3 className="mt-3 line-clamp-1 text-sm text-fg-2 transition-colors duration-200 group-hover:text-fg">
        {media.title}
      </h3>
      <div className="mt-1 flex items-baseline justify-between gap-3 text-[11px]">
        <span className="meta truncate">{secondary}</span>
        <Rating value={media.rating} variant="bare" />
      </div>
    </Link>
  );
}
