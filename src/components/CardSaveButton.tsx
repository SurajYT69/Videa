"use client";

import { Check, Plus } from "@phosphor-icons/react";
import { toggleFavorite } from "@/lib/storage";
import { toStub } from "@/lib/stub";
import { useLibrary } from "@/lib/useLibrary";
import type { MediaItem } from "@/lib/types";

/** The "+" on a poster's hover panel. Same list as FavoriteButton. */
export function CardSaveButton({ media }: { media: MediaItem }) {
  const library = useLibrary();
  const saved = library.favorites.some(
    (item) => item.type === media.type && item.tmdbId === media.tmdbId,
  );
  const label = saved ? "Remove from My List" : "Add to My List";
  const Glyph = saved ? Check : Plus;

  return (
    <button
      type="button"
      onClick={() => toggleFavorite(toStub(media))}
      aria-pressed={saved}
      title={label}
      className={`grid size-10 place-items-center rounded-full border transition-[transform,color,background-color,border-color] duration-150 ease-out-expo active:scale-[0.96] ${
        saved
          ? "border-accent bg-accent-soft text-accent"
          : "border-white/40 bg-black/40 text-white backdrop-blur-md hover:border-white"
      }`}
    >
      {/* Keyed on the state so the new glyph fades in: the swap is the only
          confirmation the click landed, and a hard cut reads as a flicker. */}
      <Glyph key={String(saved)} weight="bold" className="size-4 animate-fade" aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </button>
  );
}
