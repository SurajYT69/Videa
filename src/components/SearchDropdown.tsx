"use client";

import Image from "next/image";
import { Rating } from "./Rating";
import { POSTER, tmdbImage } from "@/lib/images";
import { metaLine, ratingLabel, typeLabel, year } from "@/lib/format";
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
  /** Header field only: widens on large screens to show the active result. */
  preview?: boolean;
};

/*
 * Radii nest: the panel is 16 with 8 of padding, so rows are 8, and the
 * poster inside a row's 8 of padding is 4.
 */
export function SearchDropdown({
  listId,
  status,
  results,
  activeIndex,
  query,
  onSelect,
  onHover,
  onSeeAll,
  preview = false,
}: Props) {
  const wide = preview && status === "ready";
  const active = wide ? (results[activeIndex] ?? results[0]) : undefined;

  return (
    <div
      className={`animate-drop absolute inset-x-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-card border border-line-strong bg-raised shadow-lift ${
        wide ? "lg:right-auto lg:left-1/2 lg:w-[44rem] lg:-translate-x-1/2" : ""
      }`}
    >
      {status === "loading" && (
        <ul className="p-2" aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <li key={i} className="flex items-center gap-3 p-2">
              <div className="skeleton h-[54px] w-9 rounded-[4px]" />
              <div className="flex-1 space-y-2">
                <div className="skeleton h-3 w-2/5 rounded-sm" />
                <div className="skeleton h-2.5 w-1/4 rounded-sm" />
              </div>
            </li>
          ))}
        </ul>
      )}

      {status === "empty" && (
        <p className="px-4 py-5 text-sm text-pretty text-fg-2">
          No titles match <span className="text-fg">&ldquo;{query}&rdquo;</span>
        </p>
      )}

      {status === "error" && (
        <p className="px-4 py-5 text-sm text-pretty text-fg-2">
          Search is unavailable right now. Try again in a moment.
        </p>
      )}

      {status === "ready" && (
        <>
          <div className={wide ? "lg:grid lg:grid-cols-[1fr_17rem]" : undefined}>
            <ul id={listId} role="listbox" aria-label="Search suggestions" className="p-2">
              {results.map((item, index) => {
                const src = tmdbImage(item.posterPath, POSTER.sm);
                const selected = index === activeIndex;
                return (
                  <li
                    key={`${item.type}-${item.tmdbId}`}
                    id={`${listId}-option-${index}`}
                    role="option"
                    aria-selected={selected}
                  >
                    <button
                      type="button"
                      tabIndex={-1}
                      onMouseDown={(event) => {
                        event.preventDefault();
                        onSelect(item);
                      }}
                      onMouseEnter={() => onHover(index)}
                      className={`flex w-full items-center gap-3 rounded-mini p-2 text-left transition-colors duration-150 ${
                        selected ? "bg-surface" : "bg-transparent"
                      }`}
                    >
                      <span className="relative h-[54px] w-9 shrink-0 overflow-hidden rounded-[4px] bg-surface">
                        {src ? (
                          <>
                            <Image src={src} alt="" fill sizes="36px" className="object-cover" />
                            <span className="pointer-events-none absolute inset-0 rounded-[4px] art-edge" />
                          </>
                        ) : (
                          <span className="grid h-full place-items-center font-mono text-xs text-fg-3">
                            {item.title.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </span>

                      <span className="min-w-0 flex-1">
                        <span
                          className={`block truncate text-sm transition-colors duration-150 ${
                            selected ? "text-fg" : "text-fg-2"
                          }`}
                        >
                          {item.title}
                        </span>
                        <span className="meta mt-0.5 block">
                          {metaLine(year(item.releaseDate), typeLabel(item.type))}
                        </span>
                      </span>

                      <span className="shrink-0 text-xs tabular-nums">
                        <Rating value={item.rating} />
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>

            {active && <Preview item={active} />}
          </div>

          {/* Keys on the left, the way out on the right. Keycaps only from md
              up, where there is a keyboard to press them on. */}
          <div className="flex items-center gap-4 border-t border-line px-4 py-2.5 text-xs text-fg-3">
            <span className="hidden items-center gap-1.5 md:flex">
              <Key>↑</Key>
              <Key>↓</Key>
              <span className="ml-0.5">to move</span>
            </span>
            <span className="hidden items-center gap-1.5 md:flex">
              <Key>↵</Key>
              <span className="ml-0.5">to open</span>
            </span>
            <button
              type="button"
              tabIndex={-1}
              onMouseDown={(event) => {
                event.preventDefault();
                onSeeAll();
              }}
              className="-my-1.5 -mr-2 ml-auto truncate rounded-full px-2 py-1.5 transition-colors hover:text-fg"
            >
              All results for &ldquo;{query}&rdquo;
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function Key({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="grid h-5 min-w-5 place-items-center rounded-[4px] border border-line-strong px-1 font-mono text-[11px] leading-none text-fg-2">
      {children}
    </kbd>
  );
}

/**
 * The active result, larger, beside the list on wide screens. Each still is
 * keyed by id, so moving through the list fades the new one in.
 */
function Preview({ item }: { item: MediaItem }) {
  const still = tmdbImage(item.backdropPath, "w300");
  const rating = ratingLabel(item.rating);
  return (
    <div className="hidden border-l border-line p-3 lg:block">
      <div className="relative aspect-video overflow-hidden rounded-mini bg-surface">
        {still && (
          <Image
            key={item.tmdbId}
            src={still}
            alt=""
            fill
            sizes="248px"
            /* TMDB's w300 already fits; no optimizer round trip per arrow key. */
            unoptimized
            className="animate-fade object-cover"
          />
        )}
        <span className="pointer-events-none absolute inset-0 rounded-mini art-edge" />
      </div>
      <p className="mt-3 text-sm font-medium text-balance text-fg">{item.title}</p>
      <p className="meta mt-1 tabular-nums">
        {metaLine(year(item.releaseDate), typeLabel(item.type), rating ? `★ ${rating}` : null)}
      </p>
      {item.overview && (
        <p className="mt-2 line-clamp-4 text-xs leading-relaxed text-pretty text-fg-2">
          {item.overview}
        </p>
      )}
    </div>
  );
}
