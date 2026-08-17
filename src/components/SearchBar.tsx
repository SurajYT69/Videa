"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { MagnifyingGlass, X } from "@phosphor-icons/react";
import { SearchDropdown, type SearchStatus } from "./SearchDropdown";
import { detailsHref } from "@/lib/playback";
import type { MediaItem } from "@/lib/types";

const DEBOUNCE_MS = 250;

type Props = {
  autoFocus?: boolean;
  placeholder?: string;
  /** `header` is a compact field that widens on focus. */
  variant?: "header" | "block";
  onNavigate?: () => void;
};

export function SearchBar({
  autoFocus = false,
  placeholder,
  variant = "header",
  onNavigate,
}: Props) {
  /* The header field is narrow until focused, so it gets the shorter prompt. */
  const prompt =
    placeholder ??
    (variant === "header" ? "Search titles" : "Search movies & TV shows");

  const router = useRouter();
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<MediaItem[]>([]);
  const [status, setStatus] = useState<SearchStatus>("idle");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  /* Debounced suggestions. In-flight requests are aborted on each keystroke
     so a slow early response cannot overwrite a newer one. */
  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setStatus("idle");
      return;
    }

    const controller = new AbortController();
    setStatus("loading");

    const timer = window.setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(trimmed)}`,
          { signal: controller.signal },
        );
        if (!res.ok) throw new Error("request failed");
        const data = (await res.json()) as { results: MediaItem[] };
        setResults(data.results);
        setStatus(data.results.length ? "ready" : "empty");
        setActiveIndex(-1);
      } catch (error) {
        if ((error as Error).name === "AbortError") return;
        setResults([]);
        setStatus("error");
      }
    }, DEBOUNCE_MS);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [query]);

  /* Dismiss on outside pointer down. */
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  const go = (href: string) => {
    setOpen(false);
    inputRef.current?.blur();
    onNavigate?.();
    router.push(href);
  };

  const submit = () => {
    const trimmed = query.trim();
    if (!trimmed) return;
    go(`/search?q=${encodeURIComponent(trimmed)}`);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      if (open) {
        setOpen(false);
      } else {
        setQuery("");
        inputRef.current?.blur();
      }
      return;
    }

    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      if (!results.length) return;
      event.preventDefault();
      setOpen(true);
      const delta = event.key === "ArrowDown" ? 1 : -1;
      setActiveIndex((current) => {
        const next = current + delta;
        if (next < 0) return results.length - 1;
        if (next >= results.length) return 0;
        return next;
      });
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      const active = activeIndex >= 0 ? results[activeIndex] : undefined;
      if (active) {
        go(detailsHref(active.type, active.tmdbId));
      } else {
        submit();
      }
    }
  };

  const showDropdown = open && status !== "idle";
  const width =
    variant === "header"
      ? "w-56 focus-within:w-80 transition-[width] duration-400 ease-out-expo"
      : "w-full";

  return (
    <div ref={rootRef} className={`relative ${width}`}>
      <form
        role="search"
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
      >
        <label htmlFor={`${listId}-input`} className="sr-only">
          Search movies and TV shows
        </label>

        <MagnifyingGlass
          className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-fg-3"
          aria-hidden="true"
        />

        <input
          id={`${listId}-input`}
          ref={inputRef}
          type="search"
          autoFocus={autoFocus}
          autoComplete="off"
          spellCheck={false}
          value={query}
          placeholder={prompt}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          role="combobox"
          aria-expanded={showDropdown}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={
            activeIndex >= 0 ? `${listId}-option-${activeIndex}` : undefined
          }
          className="w-full rounded-card border border-line-strong bg-surface py-2.5 pr-9 pl-10 text-sm text-fg placeholder:text-fg-3 transition-colors duration-200 hover:border-fg-3/60 focus:border-fg-3 focus:bg-raised [&::-webkit-search-cancel-button]:appearance-none"
        />

        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setResults([]);
              setStatus("idle");
              inputRef.current?.focus();
            }}
            className="absolute top-1/2 right-2.5 grid size-6 -translate-y-1/2 place-items-center rounded-card text-fg-3 transition-colors hover:text-fg"
          >
            <X className="size-3.5" aria-hidden="true" />
            <span className="sr-only">Clear search</span>
          </button>
        )}
      </form>

      {showDropdown && (
        <SearchDropdown
          listId={listId}
          status={status}
          results={results}
          activeIndex={activeIndex}
          query={query.trim()}
          onSelect={(item) => go(detailsHref(item.type, item.tmdbId))}
          onHover={setActiveIndex}
          onSeeAll={submit}
        />
      )}
    </div>
  );
}
