"use client";

import { BookmarkSimple } from "@phosphor-icons/react";
import { toggleFavorite } from "@/lib/storage";
import { useLibrary } from "@/lib/useLibrary";
import type { MediaStub } from "@/lib/types";

/**
 * Deliberately an icon. Saving is a small act and gets a small control.
 * Sized to the height of the primary CTA it always sits beside.
 */
export function FavoriteButton({ stub }: { stub: MediaStub }) {
  const library = useLibrary();
  const saved = library.favorites.some(
    (item) => item.type === stub.type && item.tmdbId === stub.tmdbId,
  );

  return (
    <button
      type="button"
      onClick={() => toggleFavorite(stub)}
      aria-pressed={saved}
      title={saved ? "Remove from My List" : "Add to My List"}
      className={`grid size-[58px] shrink-0 place-items-center rounded-card border transition duration-200 active:translate-y-px ${
        saved
          ? "border-accent bg-accent-soft text-accent"
          : "border-line-strong text-fg-2 hover:border-fg-3 hover:bg-raised hover:text-fg"
      }`}
    >
      <BookmarkSimple
        weight={saved ? "fill" : "regular"}
        className="size-5"
        aria-hidden="true"
      />
      <span className="sr-only">
        {saved ? "Remove from My List" : "Add to My List"}
      </span>
    </button>
  );
}
