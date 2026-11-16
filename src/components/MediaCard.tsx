import Link from "next/link";
import { Play, Star } from "@phosphor-icons/react/dist/ssr";
import { Poster } from "./Poster";
import { metaLine, ratingLabel, typeLabel, year } from "@/lib/format";
import { detailsHref, watchHref } from "@/lib/playback";
import { CardSaveButton } from "./CardSaveButton";
import { IntentLink } from "./IntentLink";
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

/*
 * Hover panel reveal. Each line rises 6px and fades in, staggered 40ms, on the
 * shared expo curve at 200ms; it leaves together and at once (the delays only
 * apply while hovered), so sweeping the pointer across a rail never leaves a
 * trail of half-open panels. Tailwind's `group-hover` is already gated to
 * hover-capable pointers, so a tap on a phone never opens it. Keyboard focus
 * reveals it too, without the stagger.
 */
const REVEAL =
  "translate-y-1.5 opacity-0 transition-[opacity,transform] duration-200 ease-out-expo group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100";

/** Press feedback; CardSaveButton carries the same classes. */
const PRESS = "transition-[transform,color,background-color,border-color] duration-150 ease-out-expo active:scale-[0.96]";

const CHIP =
  "absolute top-2 inline-flex items-center gap-1 rounded-mini bg-black/45 px-1.5 py-0.5 backdrop-blur-md font-mono text-xs text-white tabular-nums";

/**
 * The poster is the content. Rating and season count ride on it as chips, so
 * the line below only has to carry the title and when it is from.
 */
export function MediaCard({ media, sizes, priority, seasonCount, href, imageSrc }: Props) {
  const rating = ratingLabel(media.rating);

  /* Cards linked elsewhere (MAL entries) have no TMDB id to play or save. */
  const actionable = !href;

  return (
    <div className="group relative">
    <IntentLink
      href={href ?? detailsHref(media.type, media.tmdbId)}
      morph={!href}
      className="block rounded-card focus-visible:outline-offset-4"
    >
      {/* No resting shadow: eighteen of these in a grid reads as fog. */}
      <div className="relative aspect-2/3 overflow-hidden rounded-card bg-surface transition-shadow duration-200 ease-out-expo group-hover:shadow-lift [&_img]:transition-transform [&_img]:duration-500 [&_img]:ease-out-expo group-hover:[&_img]:scale-105">
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

        <div className="scrim-media pointer-events-none absolute inset-x-0 bottom-0 h-3/4 opacity-0 transition-opacity duration-200 ease-out-expo group-hover:opacity-100 group-focus-within:opacity-100" />

        <div className="pointer-events-none absolute inset-0 rounded-card art-edge" />
      </div>

      <h3 className="mt-3 line-clamp-1 text-sm font-medium text-fg-2 transition-colors duration-200 ease-out-expo group-hover:text-fg">
        {media.title}
      </h3>
      <p className="meta mt-1.5 truncate">
        {metaLine(year(media.releaseDate), typeLabel(media.type))}
      </p>
    </IntentLink>

      {/* Hover panel over the poster: title, play, save, year and genre.
          A sibling of the link, because buttons cannot nest inside one. */}
      {actionable && (
        <div className="pointer-events-none absolute inset-x-0 top-0 flex aspect-2/3 flex-col justify-end gap-2.5 p-3 text-white">
          <p className={`display line-clamp-2 text-base leading-tight ${REVEAL}`}>{media.title}</p>
          {/* Clickable only while shown, so a tap on a phone never hits a hidden button. */}
          <div
            className={`flex items-center gap-2 group-hover:pointer-events-auto group-hover:delay-40 group-focus-within:pointer-events-auto ${REVEAL}`}
          >
            <Link
              href={watchHref(media.type, media.tmdbId)}
              title="Play"
              className={`grid size-10 place-items-center rounded-full bg-fg text-ink shadow-soft ${PRESS}`}
            >
              {/* A right-pointing triangle is left-heavy; nudged right to read centred. */}
              <Play weight="fill" className="size-4 translate-x-px" aria-hidden="true" />
              <span className="sr-only">Play {media.title}</span>
            </Link>
            <CardSaveButton media={media} />
          </div>
          <p className={`truncate font-mono text-xs text-white/80 group-hover:delay-80 ${REVEAL}`}>
            {metaLine(year(media.releaseDate), media.genres[0] ?? typeLabel(media.type))}
          </p>
        </div>
      )}
    </div>
  );
}
