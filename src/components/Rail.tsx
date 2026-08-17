"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";

type Props = {
  /** Accessible name for the scroll region. */
  label: string;
  children: React.ReactNode;
};

/**
 * Horizontal scroll region with optional desktop arrows.
 *
 * The children stay server-rendered: only the scroll container and the two
 * buttons are client code. The arrows appear solely when there is somewhere to
 * scroll, and never on touch layouts, where swiping is the affordance.
 *
 * The scroll listener is on the rail element, not on `window`. The project rule
 * against window scroll listeners exists so nothing runs per frame during page
 * scroll; a listener scoped to this element only fires while the rail itself is
 * being dragged, and there is no other way to know whether it can still move.
 *
 * The wrapper is `overflow-x: clip` because a scroller's width otherwise
 * propagates all the way up to <main>: the document reported a 3671px scroll
 * width at 1440px, and only `body { overflow-x: hidden }` stopped the page
 * moving — which suppresses the scrollbar but not a focus() on an off-screen
 * card. `clip` contains it without creating a second scroll container.
 */
export function Rail({ label, children }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(true);

  const sync = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setAtStart(el.scrollLeft <= 1);
    /* A one-pixel slack keeps sub-pixel layouts from reporting "not at end". */
    setAtEnd(max <= 1 || el.scrollLeft >= max - 1);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    sync();
    el.addEventListener("scroll", sync, { passive: true });
    const observer = new ResizeObserver(sync);
    observer.observe(el);
    return () => {
      el.removeEventListener("scroll", sync);
      observer.disconnect();
    };
  }, [sync]);

  const nudge = (direction: -1 | 1) => {
    const el = ref.current;
    if (!el) return;
    /* Just under a full screen, so one card always carries over as context. */
    el.scrollBy({ left: direction * el.clientWidth * 0.82, behavior: "smooth" });
  };

  const scrollable = !(atStart && atEnd);

  return (
    <div className="group/rail relative overflow-x-clip">
      <div
        ref={ref}
        role="region"
        aria-label={label}
        tabIndex={0}
        className="rail rail-gutter gap-4 pb-2 md:gap-5"
      >
        {children}
      </div>

      {scrollable && (
        <>
          <Arrow
            side="left"
            hidden={atStart}
            onClick={() => nudge(-1)}
            label={`Scroll ${label} backwards`}
          />
          <Arrow
            side="right"
            hidden={atEnd}
            onClick={() => nudge(1)}
            label={`Scroll ${label} forwards`}
          />
        </>
      )}
    </div>
  );
}

function Arrow({
  side,
  hidden,
  onClick,
  label,
}: {
  side: "left" | "right";
  hidden: boolean;
  onClick: () => void;
  label: string;
}) {
  const Icon = side === "left" ? CaretLeft : CaretRight;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-hidden={hidden}
      tabIndex={hidden ? -1 : 0}
      className={`absolute top-[38%] z-10 hidden size-11 -translate-y-1/2 place-items-center rounded-full border border-line bg-raised/90 text-fg-2 shadow-soft backdrop-blur-sm transition duration-200 hover:border-fg-3 hover:text-fg md:grid ${
        side === "left" ? "left-2 xl:left-4" : "right-2 xl:right-4"
      } ${
        hidden
          ? "pointer-events-none opacity-0"
          : "opacity-0 group-hover/rail:opacity-100 focus-visible:opacity-100"
      }`}
    >
      <Icon className="size-4" aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </button>
  );
}
