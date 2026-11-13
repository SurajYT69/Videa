import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { Poster } from "./Poster";
import { BACKDROP, tmdbImage } from "@/lib/images";
import { detailsHref } from "@/lib/playback";
import { getCollection } from "@/lib/tmdb";

/**
 * The series of films a movie belongs to. A second TMDB call, so it lives
 * behind Suspense on the movie page and never holds up the title.
 *
 * The backdrop is shown at full strength on the right and masked out toward
 * the text, rather than dimmed everywhere: dimming the whole still is what
 * made it read as low quality. The posters sit as a fan that opens on hover.
 */
export async function CollectionBanner({ id }: { id: number }) {
  const collection = await getCollection(id).catch(() => null);
  if (!collection || collection.parts.length < 2) return null;

  const src = tmdbImage(collection.backdropPath, BACKDROP.lg);
  const parts = collection.parts.slice(0, 5);
  const mid = (parts.length - 1) / 2;

  return (
    <div className="page pt-2 pb-2">
      <div className="relative isolate overflow-hidden rounded-card border border-white/10 bg-surface">
        {src && (
          <div className="absolute inset-y-0 right-0 -z-10 w-full [mask-image:linear-gradient(to_right,transparent,black_55%)] md:w-3/4">
            <Image
              src={src}
              alt=""
              fill
              /* The image box is the right three quarters of the banner. */
              sizes="(min-width: 768px) 75vw, 100vw"
              className="object-cover object-[50%_30%]"
            />
          </div>
        )}
        {/* Grounds the fan and the bottom edge without dimming the still. */}
        <div className="absolute inset-x-0 bottom-0 -z-10 h-1/2 bg-gradient-to-t from-ink/70 to-transparent" />

        <div className="flex flex-col gap-8 p-6 md:flex-row md:items-center md:justify-between md:p-8">
          <div className="max-w-[60ch]">
            <span className="inline-block rounded-mini bg-accent px-2 py-1 font-mono text-[11px] font-medium tracking-[0.12em] text-ink uppercase">
              Collection
            </span>
            <h2 className="display mt-4 text-2xl text-fg md:text-3xl">{collection.name}</h2>
            <p className="meta mt-2">{collection.parts.length} movies</p>
            {collection.overview && (
              <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-fg-2">
                {collection.overview}
              </p>
            )}
          </div>

          <ul className="fan flex shrink-0 items-end justify-center self-center py-4 md:mr-12">
            {parts.map((part, index) => {
              const offset = index - mid;
              return (
                <li
                  key={part.tmdbId}
                  style={
                    {
                      "--o": offset,
                      "--lift": `${Math.abs(offset) * 8}px`,
                    } as CSSProperties
                  }
                >
                  <Link
                    href={detailsHref("movie", part.tmdbId)}
                    title={part.title}
                    className="relative block aspect-2/3 w-28 overflow-hidden rounded-card shadow-lift md:w-36"
                  >
                    <Poster
                      path={part.posterPath}
                      title={part.title}
                      /* Measured: 112px phone, 144px md up. */
                      sizes="(min-width: 768px) 144px, 112px"
                    />
                    <span className="pointer-events-none absolute inset-0 rounded-card art-edge" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
