"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import Image from "next/image";

const INTERVAL_MS = 8000;
/* How long the outgoing slide stays opaque under the incoming one. */
const LEAVE_MS = 700;
const SWIPE_PX = 40;

export type HeroThumb = { title: string; src: string | null };

/**
 * Cycles the hero through a few titles.
 *
 * Motion has one current: "next" runs left. On a change the outgoing copy
 * accelerates out to the left and is gone before the incoming copy arrives
 * from the right, already moving, decelerating into place. The artwork carries
 * the same vector underneath: the incoming still slides in from the right as
 * it fades over the outgoing one, which stays opaque until it is covered, so
 * the frame never dips to the ground. Going back (an earlier thumb, a swipe
 * right) is the one cause that reverses it.
 *
 * Between changes nothing idles. The only sustained motion is the progress
 * fill on the active thumb, which is the timer itself.
 *
 * Slides are server-rendered `Hero`s stacked in one grid cell. Inactive ones
 * are `inert`. Auto-advance pauses on hover and focus and never starts under
 * reduced motion; the CSS drops the travel there too.
 */
export function HeroCarousel({
  slides,
  thumbs,
}: {
  slides: ReactNode[];
  thumbs?: HeroThumb[];
}) {
  const [index, setIndex] = useState(0);
  const [leaving, setLeaving] = useState<number | null>(null);
  const [dir, setDir] = useState<1 | -1>(1);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);
  const touchX = useRef<number | null>(null);
  const count = slides.length;

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  const go = (next: number, direction: 1 | -1) => {
    if (next === index) return;
    setDir(direction);
    setLeaving(index);
    setIndex(next);
  };

  /* The outgoing slide is released once the incoming one fully covers it. */
  useEffect(() => {
    if (leaving === null) return;
    const timer = window.setTimeout(() => setLeaving(null), LEAVE_MS);
    return () => window.clearTimeout(timer);
  }, [leaving]);

  /* The progress fill is the clock: its animationend advances the slide, and
     pausing it (hover, focus) pauses the countdown exactly where it stands. */
  const advance = () => {
    if (!reduced && count > 1) go((index + 1) % count, 1);
  };

  return (
    <div
      className="relative grid touch-pan-y"
      style={{ "--hero-dir": dir } as CSSProperties}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onPointerDown={(event) => {
        if (event.pointerType !== "mouse") touchX.current = event.clientX;
      }}
      onPointerUp={(event) => {
        const start = touchX.current;
        touchX.current = null;
        if (start === null || count < 2) return;
        const dx = event.clientX - start;
        if (dx <= -SWIPE_PX) go((index + 1) % count, 1);
        else if (dx >= SWIPE_PX) go((index - 1 + count) % count, -1);
      }}
      onPointerCancel={() => (touchX.current = null)}
      aria-roledescription="carousel"
      aria-label="Trending now"
    >
      {slides.map((slide, i) => {
        /* "entering" only during a change, so the first paint does not animate. */
        const state =
          i === index
            ? leaving === null ? "active" : "entering"
            : i === leaving ? "leaving" : "idle";
        return (
          <div
            key={i}
            data-hero-slide={state}
            className="col-start-1 row-start-1"
            inert={i !== index}
            aria-hidden={i !== index}
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${count}`}
          >
            {slide}
          </div>
        );
      })}

      {count > 1 && (
        <div
          className="absolute right-5 bottom-6 z-20 flex items-end gap-2 md:right-12 md:bottom-10 md:gap-3"
          data-paused={paused || reduced ? "" : undefined}
        >
          {slides.map((_, i) => {
            const active = i === index;
            const thumb = thumbs?.[i];
            return (
              <button
                key={i}
                type="button"
                onClick={() => go(i, i > index ? 1 : -1)}
                aria-label={thumb ? `Show ${thumb.title}` : `Show slide ${i + 1}`}
                aria-current={active ? "true" : undefined}
                className="group/thumb flex flex-col items-stretch gap-2"
              >
                {/* Stills from md up; phones keep the bars alone. */}
                {thumb?.src && (
                  <span
                    className={`relative hidden aspect-video w-28 overflow-hidden rounded-mini transition-opacity duration-300 md:block ${
                      active ? "opacity-100" : "opacity-45 group-hover/thumb:opacity-80"
                    }`}
                  >
                    <Image
                      src={thumb.src}
                      alt=""
                      fill
                      sizes="112px"
                      /* TMDB's own w300: skips the optimizer queue the hero is in. */
                      unoptimized
                      className="object-cover"
                    />
                    <span className="pointer-events-none absolute inset-0 rounded-mini art-edge" />
                  </span>
                )}
                <span
                  className={`relative block h-1 overflow-hidden rounded-full bg-white/25 ${
                    thumb?.src ? "w-8 md:w-28" : "w-8"
                  }`}
                >
                  {active && (
                    <span
                      key={index}
                      className="hero-progress absolute inset-0 origin-left rounded-full bg-accent"
                      style={{ animationDuration: `${INTERVAL_MS}ms` }}
                      onAnimationEnd={advance}
                    />
                  )}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
