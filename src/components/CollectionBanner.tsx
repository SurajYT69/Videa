import Image from "next/image";
import Link from "next/link";
import { Poster } from "./Poster";
import { BACKDROP, tmdbImage } from "@/lib/images";
import { detailsHref } from "@/lib/playback";
import { getCollection } from "@/lib/tmdb";

/**
 * The series of films a movie belongs to. A second TMDB call, so it lives
 * behind Suspense on the movie page and never holds up the title.
 */
export async function CollectionBanner({ id }: { id: number }) {
  const collection = await getCollection(id).catch(() => null);
  if (!collection || collection.parts.length < 2) return null;

  const src = tmdbImage(collection.backdropPath, BACKDROP.lg);

  return (
    <div className="page pt-2 pb-2">
      <div className="relative isolate overflow-hidden rounded-card border border-white/10 bg-surface">
        {src && (
          <Image
            src={src}
            alt=""
            fill
            sizes="(min-width: 1536px) 1344px, 100vw"
            className="-z-10 object-cover opacity-45"
          />
        )}
        <div className="scrim-left absolute inset-0 -z-10" />

        <div className="flex flex-wrap items-center justify-between gap-8 p-6 md:p-8">
          <div className="max-w-[64ch]">
            <span className="inline-block rounded-mini bg-accent px-2 py-1 font-mono text-[11px] font-medium tracking-[0.12em] text-ink uppercase">
              Collection
            </span>
            <h2 className="display mt-4 text-2xl text-fg">{collection.name}</h2>
            <p className="meta mt-2">{collection.parts.length} movies</p>
            {collection.overview && (
              <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-fg-2">
                {collection.overview}
              </p>
            )}
          </div>

          <ul className="flex -space-x-5">
            {collection.parts.slice(0, 4).map((part) => (
              <li key={part.tmdbId} className="hover:z-10">
                <Link
                  href={detailsHref("movie", part.tmdbId)}
                  title={part.title}
                  className="relative block aspect-2/3 w-24 overflow-hidden rounded-mini shadow-lift md:w-28"
                >
                  <Poster path={part.posterPath} title={part.title} sizes="112px" />
                  <span className="pointer-events-none absolute inset-0 rounded-mini art-edge" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
