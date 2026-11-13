"use client";

import { useEffect, useState, type ReactNode } from "react";

const INTERVAL_MS = 8000;

/**
 * Cycles the homepage hero through a few trending titles.
 *
 * The slides are server-rendered `Hero`s passed in as children, stacked in
 * one grid cell so the box keeps the height of the tallest. Only the active
 * slide is visible and reachable; the rest are `inert`. Auto-advance pauses
 * while the pointer or focus is inside, and never starts under
 * `prefers-reduced-motion`.
 */
export function HeroCarousel({ slides }: { slides: ReactNode[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = slides.length;

  useEffect(() => {
    if (count < 2 || paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setTimeout(() => setIndex((i) => (i + 1) % count), INTERVAL_MS);
    return () => window.clearTimeout(timer);
  }, [index, paused, count]);

  return (
    <div
      className="relative grid md:-ml-18"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      aria-roledescription="carousel"
      aria-label="Trending now"
    >
      {slides.map((slide, i) => {
        const active = i === index;
        return (
          <div
            key={i}
            className={`col-start-1 row-start-1 transition-opacity duration-700 ease-out-expo ${
              active ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
            inert={!active}
            aria-hidden={!active}
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${count}`}
          >
            {slide}
          </div>
        );
      })}

      {count > 1 && (
        <div className="absolute right-5 bottom-6 z-10 flex items-center gap-2 md:right-12 md:bottom-10">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Show slide ${i + 1}`}
              aria-current={i === index ? "true" : undefined}
              className="grid h-6 place-items-center px-0.5"
            >
              <span
                className={`block h-1 rounded-full transition-[width,background-color] duration-300 ${
                  i === index ? "w-8 bg-accent" : "w-4 bg-white/35 hover:bg-white/60"
                }`}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
