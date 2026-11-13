"use client";

import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { ThemeToggle, type ThemeMode } from "./ui/theme-toggle";

/** LocalStorage key. A plain "light" | "dark", read before paint by the script in layout.tsx. */
export const THEME_KEY = "oovi-theme";

/* Page grounds, matching --color-ink in each mode: the reveal's paint and the
   mobile status bar. */
const GROUND: Record<ThemeMode, string> = { dark: "#0b0c0e", light: "#f5f6f8" };

/* Strong ease-in-out for on-screen movement, and a strong ease-out for the fade. */
const EASE_IN_OUT = "cubic-bezier(0.77, 0, 0.175, 1)";
const EASE_OUT = "cubic-bezier(0.23, 1, 0.32, 1)";

function readMode(): ThemeMode {
  return document.documentElement.dataset.mode === "light" ? "light" : "dark";
}

const nextFrame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

let revealing = false;

/**
 * The theme reveal, built only from transform and opacity so the compositor
 * runs every frame. Measured in Chrome 151: the library's clip-path reveal ran
 * on the main thread at ~30fps however lean the script was; opacity held 60.
 *
 * 1. A blob of the new ground grows out of the toggle (transform).
 * 2. With the screen covered, the mode flips. The full-page restyle, the one
 *    expensive step, happens here where nobody can see it.
 * 3. Two frames later, once the new page has painted, the blob fades (opacity).
 */
async function revealTheme(next: ThemeMode, from: { x: number; y: number }) {
  const root = document.documentElement;
  if (revealing || root.dataset.mode === next) return;
  if (matchMedia("(prefers-reduced-motion: reduce)").matches || document.hidden) {
    root.dataset.mode = next;
    return;
  }
  revealing = true;

  const { innerWidth: w, innerHeight: h } = window;
  /* Radius that covers the farthest corner, plus slack for the uneven edge. */
  const reach = Math.hypot(Math.max(from.x, w - from.x), Math.max(from.y, h - from.y)) * 1.12;
  const size = Math.ceil(reach * 2);
  const blob = document.createElement("div");
  blob.setAttribute("aria-hidden", "true");
  blob.style.cssText = [
    "position:fixed",
    `left:${from.x - size / 2}px`,
    `top:${from.y - size / 2}px`,
    `width:${size}px`,
    `height:${size}px`,
    /* Uneven radii read as organic rather than a geometric circle. */
    "border-radius:47% 53% 44% 56% / 52% 45% 55% 48%",
    `background:${GROUND[next]}`,
    "z-index:2147483647",
    "pointer-events:none",
    "transform:scale(0.02)",
    "will-change:transform,opacity",
  ].join(";");
  document.body.append(blob);

  try {
    await blob.animate(
      [
        { transform: "scale(0.02) rotate(-24deg)" },
        { transform: "scale(1) rotate(0deg)" },
      ],
      { duration: 560, easing: EASE_IN_OUT, fill: "forwards" },
    ).finished;

    /* Flip and start the fade in the same task. The fade's start time resolves
       on the first frame that actually commits, and that frame already carries
       the restyled page, so the blob stays solid for exactly one restyle and
       not a frame longer. Transitions stay off (see globals.css) until the fade
       is done: turning them back on is another full-page recalc, and after the
       animation nobody can see it. */
    root.setAttribute("data-theme-switching", "");
    root.dataset.mode = next;
    await blob.animate([{ opacity: 1 }, { opacity: 0 }], {
      duration: 280,
      easing: EASE_OUT,
      fill: "forwards",
    }).finished;
    await nextFrame();
  } finally {
    root.removeAttribute("data-theme-switching");
    root.dataset.mode = next;
    blob.remove();
    revealing = false;
  }
}

/**
 * The app side of the toggle: it owns the mode, persists it, and keeps
 * theme-color in step. The observer mirrors `data-mode` back into state,
 * whoever changed it.
 */
export function ThemeSwitch({ className }: { className?: string }) {
  const [mode, setMode] = useState<ThemeMode>("dark");
  const origin = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const root = document.documentElement;
    const sync = () => {
      const next = readMode();
      /* Synchronous, so the icon finishes re-rendering while the blob still
         covers the page rather than during the fade. */
      flushSync(() => setMode(next));
      document
        .querySelectorAll('meta[name="theme-color"]')
        .forEach((meta) => meta.setAttribute("content", GROUND[next]));
      try {
        localStorage.setItem(THEME_KEY, next);
      } catch {
        /* Private mode or quota: the choice just won't persist. */
      }
    };
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(root, { attributes: true, attributeFilter: ["data-mode"] });
    return () => observer.disconnect();
  }, []);

  return (
    <ThemeToggle
      mode={mode}
      showLabel={false}
      className={className}
      /* Measured: the jelly outline and click ripple run for ~0.8s after a click
         and write the button's transform every frame. On a 44px icon they are
         barely visible, so they stay off; the icon morph is the toggle's
         character and it stays. */
      data-morph="none"
      data-flow="off"
      onClick={(event) => {
        const r = event.currentTarget.getBoundingClientRect();
        origin.current = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      }}
      onModeChange={(next) => void revealTheme(next, origin.current)}
    />
  );
}
