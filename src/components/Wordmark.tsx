import { LogoEyes } from "./LogoEyes";

/**
 * The oovi wordmark, inlined so it stays crisp and inherits text colour.
 *
 * Artwork source of truth is logos/oovi/logo.svg. The two o's are the eyes:
 * accent discs with a pupil in the page ground, set right of centre so they
 * look toward the rest of the word. There is no separate mark in the lockup;
 * the square icon (logos/oovi/mark.svg) is the eyes on their own.
 *
 * Letterforms are shapes rather than a font, so the logo can never fall back
 * to a system face. The eyes are live (`LogoEyes`): pupils follow the pointer
 * and the eyes blink on `oovi:blink` or when the logo is pressed.
 */
export function Wordmark({ className = "h-7 w-auto" }: { className?: string }) {
  return (
    <svg
      viewBox="0 -44 350 144"
      className={className}
      role="img"
      aria-label="oovi"
    >
      <LogoEyes />
      <circle cx="337" cy="-28" r="16" fill="var(--color-mark)" />
      <g fill="currentColor">
        <path d="M216 0 H245 L265 64 L285 0 H314 L279 100 H251 Z" />
        <path d="M324 0 H350 V100 H324 Z" />
      </g>
    </svg>
  );
}
/** The eyes alone. Used where there is no room for the word, such as the rail. */
export function EyesMark({ className = "h-4 w-auto" }: { className?: string }) {
  return (
    <svg viewBox="0 0 208 100" className={className} role="img" aria-label="oovi">
      <LogoEyes />
    </svg>
  );
}
