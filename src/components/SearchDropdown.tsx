"use client";

import Image from "next/image";
import { Rating } from "./Rating";
import { POSTER, tmdbImage } from "@/lib/images";
import { metaLine, typeLabel, year } from "@/lib/format";
import type { MediaItem } from "@/lib/types";

export type SearchStatus = "idle" | "loading" | "ready" | "empty" | "error";

type Props = {
  listId: string;
  status: SearchStatus;
  results: MediaItem[];
  activeIndex: number;
  query: string;
  onSelect: (item: MediaItem) => void;
  onHover: (index: number) => void;
  onSeeAll: () => void;
};

export function SearchDropdown({
  listId,
  status,
  results,
  activeIndex,
  query,
  onSelect,
  onHover,
  onSeeAll,
}: Props) {
  return (
    <div className="animate-drop absolute inset-x-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-card border border-line-strong bg-raised shadow-lift">
      {status === "loading" && (
        <ul className="p-2" aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <li key={i} className="flex items-center gap-3 p-2">
              <div className="skeleton h-[54px] w-9 rounded-mini" />
              <div className="flex-1 space-y-2">
                <div className="skeleton h-3 w-2/5 rounded-[3px]" />
                <div className="skeleton h-2.5 w-1/4 rounded-[3px]" />
              </div>
            </li>
          ))}
        </ul>
      )}

      {status === "empty" && (
        <p className="px-4 py-5 text-sm text-fg-2">
          No titles match{" "}
          <span className="text-fg">&ldquo;{query}&rdquo;</span>.
        </p>
      )}

      {status === "error" && (
        <p className="px-4 py-5 text-sm text-fg-2">
          Search is unavailable right now. Try again in a moment.
        </p>
      )}

      {status === "ready" && (
        <>
          <ul id={listId} role="listbox" aria-label="Search suggestions" className="p-2">
            {results.map((item, index) => {
              const src = tmdbImage(item.posterPath, POSTER.sm);
              const active = index === activeIndex;
              return (
                <li
                  key={`${item.type}-${item.tmdbId}`}
                  id={`${listId}-option-${index}`}
                  role="option"
                  aria-selected={active}
                >
                  <button
                    type="button"
                    tabIndex={-1}
                    onMouseDown={(event) => {
                      event.preventDefault();
                      onSelect(item);
                    }}
                    onMouseEnter={() => onHover(index)}
                    className={`flex w-full items-center gap-3 rounded-card p-2 text-left transition-colors duration-150 ${
                      active ? "bg-surface" : "bg-transparent"
                    }`}
                  >
                    <span className="relative h-[54px] w-9 shrink-0 overflow-hidden rounded-mini bg-surface">
                      {src ? (
                        <Image
                          src={src}
                          alt=""
                          fill
                          sizes="36px"
                          className="object-cover"
                        />
                      ) : (
                        <span className="grid h-full place-items-center font-mono text-xs text-fg-3">
                          {item.title.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm text-fg">
                        {item.title}
                      </span>
                      <span className="meta mt-0.5 block">
                        {metaLine(year(item.releaseDate), typeLabel(item.type))}
                      </span>
                    </span>

                    <span className="shrink-0 text-[11px]">
                      <Rating value={item.rating} variant="bare" />
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          <button
            type="button"
            tabIndex={-1}
            onMouseDown={(event) => {
              event.preventDefault();
              onSeeAll();
            }}
            className="w-full border-t border-line px-4 py-3 text-left text-xs text-fg-3 transition-colors hover:bg-surface hover:text-fg"
          >
            See all results for &ldquo;{query}&rdquo;
          </button>
        </>
      )}
    </div>
  );
}
