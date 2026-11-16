import { Hero } from "./Hero";
import { heroThumb } from "@/lib/heroThumb";
import { HeroCarousel } from "./HeroCarousel";
import type { MediaItem } from "@/lib/types";

/**
 * The opener for a section page (Movies, TV, Anime): the same slider as the
 * homepage, fed with that section's own titles. Only titles with a backdrop
 * qualify, since the hero composition needs wide artwork.
 */
export function PageHero({ items, eyebrow }: { items: MediaItem[]; eyebrow: string }) {
  const slides = items.filter((item) => item.backdropPath).slice(0, 5);
  if (!slides.length) return null;

  return (
    <HeroCarousel
      thumbs={slides.map(heroThumb)}
      slides={slides.map((item, index) => (
        <Hero key={item.tmdbId} media={item} eyebrow={eyebrow} priority={index === 0} />
      ))}
    />
  );
}

/** The ids a page hero used, so the rail under it does not repeat them. */
export function heroIds(items: MediaItem[]): Set<number> {
  return new Set(
    items
      .filter((item) => item.backdropPath)
      .slice(0, 5)
      .map((item) => item.tmdbId),
  );
}
