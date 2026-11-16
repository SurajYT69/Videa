"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ComponentProps, MouseEvent } from "react";

/*
 * Once per href for the life of the tab: sweeping a pointer across a rail
 * must not turn into a prefetch storm.
 */
const prefetched = new Set<string>();

/** The shared name the clicked card's artwork and the title hero take. */
const ART = "title-art";

type Props = ComponentProps<typeof Link> & {
  href: string;
  /** Grow this card's artwork (its `img`) into the title page hero on click. */
  morph?: boolean;
};

/**
 * `next/link` plus two things it does not do for dynamic routes:
 *
 * - Prefetch on intent. Link's own prefetch stops at the nearest `loading.tsx`
 *   for a dynamic page; this asks for the full payload, but only once the
 *   viewer points at, focuses or touches the card.
 * - A view transition on click. Plain `document.startViewTransition`, not
 *   Next's `experimental.viewTransition`, which swaps the whole app onto
 *   React's experimental channel.
 */
export function IntentLink({ href, morph, onClick, ...rest }: Props) {
  const router = useRouter();

  const prefetch = () => {
    if (prefetched.has(href)) return;
    prefetched.add(href);
    /* `PrefetchKind.FULL`; the enum is not a public export. */
    router.prefetch(href, { kind: "full" } as unknown as Parameters<
      typeof router.prefetch
    >[1]);
  };

  const navigate = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      typeof document.startViewTransition !== "function" ||
      matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return; /* Link navigates as usual. */
    }

    event.preventDefault();
    const art = morph
      ? event.currentTarget.querySelector<HTMLElement>("img")
      : null;
    if (art) art.style.viewTransitionName = ART;

    const root = document.documentElement;
    const path = href.split(/[?#]/)[0] ?? href;
    const transition = document.startViewTransition(async () => {
      /* Old state captured: hand the name over to the incoming hero. */
      if (art) {
        art.style.viewTransitionName = "";
        root.dataset.vtArt = "";
      }
      router.push(href);
      await arrived(path, Boolean(art));
    });
    transition.finished.finally(() => delete root.dataset.vtArt);
  };

  return (
    <Link
      href={href}
      onClick={navigate}
      onPointerEnter={(e) => e.pointerType !== "touch" && prefetch()}
      onFocus={prefetch}
      onTouchStart={prefetch}
      {...rest}
    />
  );
}

/*
 * Resolves once the new page is in the DOM, so the snapshot is of it and not
 * of the old one. The screen is frozen meanwhile, hence the short ceiling: an
 * unprefetched page lands as a plain swap rather than a stalled frame.
 */
function arrived(path: string, needsHero: boolean): Promise<void> {
  const start = performance.now();
  return new Promise((resolve) => {
    const check = () => {
      const here = location.pathname === path;
      const ready =
        here &&
        (!needsHero || document.querySelector("[data-title-hero] img") !== null);
      if (ready || performance.now() - start > 600) resolve();
      else requestAnimationFrame(check);
    };
    check();
  });
}
