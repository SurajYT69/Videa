import Link from "next/link";
import { Play, Star } from "@phosphor-icons/react/dist/ssr";
import { Poster } from "./Poster";
import { metaLine, ratingLabel, typeLabel, year } from "@/lib/format";
import { detailsHref } from "@/lib/playback";
import type { MediaItem } from "@/lib/types";

type Props = {
  media: MediaItem;
  sizes: string;
  priority?: boolean;
  /** Shown as a chip on the poster for series, when the count is known. */
  seasonCount?: number;
  /** Overrides the title page link, for cards not backed by a TMDB id. */
  href?: string;
  /** Overrides the TMDB poster with a full image URL. */
  imageSrc?: string | null;
};

const CHIP =
  "absolute top-2 inline-flex items-center gap-1 rounded-mini bg-black/45 px-1.5 py-0.5 backdrop-blur-md font-mono text-xs text-white tabular-nums";

/**
 * The poster is the content. Rating and season count ride on it as chips, so
 * the line below only has to carry the title and when it is from.
 */
export function MediaCard({ media, sizes, priority, seasonCount, href, imageSrc }: Props) {
  const rating = ratingLabel(media.rating);

  return (
    <Link
      href={href ?? detailsHref(media.type, media.tmdbId)}
      className="group block rounded-card focus-visible:outline-offset-4"
    >
      {/* No resting shadow: eighteen of these in a grid reads as fog. */}
      <div className="relative aspect-2/3 overflow-hidden rounded-card bg-surface transition-shadow duration-300 group-hover:shadow-lift">
        <Poster
          path={media.posterPath}
          title={media.title}
          sizes={sizes}
          priority={priority}
          src={imageSrc}
        />

        {media.type === "tv" && seasonCount ? (
          <span className={`${CHIP} left-2`}>
            {seasonCount} season{seasonCount === 1 ? "" : "s"}
          </span>
        ) : null}

        {rating && (
          <span className={`${CHIP} right-2`}>
            <Star weight="fill" className="size-3 text-accent" aria-hidden="true" />
            {rating}
            <span className="sr-only">out of 10</span>
          </span>
        )}

        <div className="scrim-media pointer-events-none absolute inset-x-0 bottom-0 h-1/2 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        <span className="pointer-events-none absolute right-2 bottom-2 grid size-9 translate-y-2 place-items-center rounded-full bg-fg text-ink opacity-0 shadow-soft transition duration-300 ease-out-expo group-hover:translate-y-0 group-hover:opacity-100">
          {/* A right-pointing triangle is left-heavy; nudged right to read centred. */}
          <Play weight="fill" className="size-4 translate-x-px" aria-hidden="true" />
        </span>

        <div className="pointer-events-none absolute inset-0 rounded-card art-edge" />
      </div>

      <h3 className="mt-3 line-clamp-1 text-sm font-medium text-fg-2 transition-colors duration-200 group-hover:text-fg">
        {media.title}
      </h3>
      <p className="meta mt-1.5 truncate">
        {metaLine(year(media.releaseDate), typeLabel(media.type))}
      </p>
    </Link>
  );
}
