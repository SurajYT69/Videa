import { Suspense } from "react";
import Image from "next/image";
import { POSTER, tmdbImage } from "@/lib/images";
import { getTrending } from "@/lib/tmdb";

/*
 * A tilted wall of this week's trending posters, dimmed and faded into the
 * ground. It sits behind openers that have no single title to show (My List,
 * the empty search page), so the top of the page is not a blank field.
 * Decorative only: hidden from assistive tech, never clickable.
 */
async function Wall() {
  const items = await getTrending().catch(() => []);
  const posters = items
    .map((item) => tmdbImage(item.posterPath, POSTER.sm))
    .filter((src): src is string => Boolean(src))
    .slice(0, 24);
  if (posters.length < 8) return null;

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute -inset-x-[10%] -top-1/4 grid -rotate-6 grid-cols-4 gap-3 opacity-40 sm:grid-cols-6 lg:grid-cols-8">
        {posters.map((src, index) => (
          <div key={index} className="relative aspect-2/3 overflow-hidden rounded-card bg-surface">
            {/* Rendered about 120–190px wide across breakpoints. */}
            <Image src={src} alt="" fill sizes="(min-width: 1024px) 190px, 120px" className="object-cover" />
          </div>
        ))}
      </div>
      {/* Dense where the text sits, so the wall reads as texture, not content. */}
      <div className="scrim-left absolute inset-0" />
      <div className="scrim-bottom absolute inset-x-0 bottom-0 h-3/4" />
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-ink to-transparent" />
    </div>
  );
}

export function PosterWall() {
  return (
    <Suspense fallback={null}>
      <Wall />
    </Suspense>
  );
}
