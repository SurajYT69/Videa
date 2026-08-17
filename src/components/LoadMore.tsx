"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";

/**
 * The Load more control.
 *
 * It stays an `<a href>` so middle-click, keyboard and a copied link all still
 * work, and so the next page is a real URL rather than client-only state.
 *
 * The position is restored by hand because `scroll={false}` does not survive
 * this navigation. Next 15.5 serializes it correctly — `"scroll":false` is in
 * the flight payload — but on a same-route searchParams change the segment
 * cache path loses it, and `layout-router` runs its focus-and-scroll anyway
 * (`htmlElement.scrollTop = 0` from `componentDidUpdate`). Without this, every
 * click from the bottom of the list threw the viewer back to the page header,
 * which is the one thing "Load more" exists to avoid.
 *
 * The restore runs in an effect rather than a layout effect on purpose: layout
 * effects fire child-first, so Next's ancestor `componentDidUpdate` would land
 * after it and win.
 */
export function LoadMore({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
}) {
  const target = useRef<number | null>(null);

  useEffect(() => {
    /* Only set by a click, so back-navigation restores normally instead. */
    if (target.current === null) return;
    const top = target.current;
    target.current = null;
    window.scrollTo({ top, behavior: "instant" });
  }, [href]);

  return (
    <Link
      href={href}
      scroll={false}
      prefetch={false}
      className={className}
      onClick={() => {
        target.current = window.scrollY;
      }}
    >
      {children}
    </Link>
  );
}
