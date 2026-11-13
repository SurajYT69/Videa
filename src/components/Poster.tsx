import Image from "next/image";
import { POSTER, tmdbImage } from "@/lib/images";

type Props = {
  path: string | null;
  title: string;
  sizes: string;
  priority?: boolean;
  size?: keyof typeof POSTER;
  /** A full image URL that replaces the TMDB path, e.g. a MAL poster. */
  src?: string | null;
};

/**
 * Poster artwork with a typographic fallback. A missing image resolves to a
 * quiet monogram rather than a broken-image glyph.
 */
export function Poster({
  path,
  title,
  sizes,
  priority = false,
  size = "md",
  src: override,
}: Props) {
  const src = override ?? tmdbImage(path, POSTER[size]);

  if (!src) {
    return (
      <div
        className="flex h-full w-full items-center justify-center bg-surface ring-1 ring-line ring-inset"
        aria-hidden="true"
      >
        <span className="font-mono text-2xl font-medium text-fg-3">
          {title.trim().charAt(0).toUpperCase() || "?"}
        </span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={`${title} poster`}
      fill
      sizes={sizes}
      priority={priority}
      className="object-cover"
    />
  );
}
