/**
 * The oovi wordmark, inlined so it stays crisp and inherits text colour.
 *
 * Artwork source of truth is logos/oovi/logo.svg. The two o's are the eyes:
 * accent discs with a pupil in the page ground, set right of centre so they
 * look toward the rest of the word. There is no separate mark in the lockup;
 * the square icon (logos/oovi/mark.svg) is the eyes on their own.
 *
 * Letterforms are shapes rather than a font, so the logo can never fall back
 * to a system face.
 */
export function Wordmark({ className = "h-7 w-auto" }: { className?: string }) {
  return (
    <svg
      viewBox="0 -44 350 144"
      className={className}
      role="img"
      aria-label="oovi"
    >
      <g fill="var(--color-accent)">
        <circle cx="50" cy="50" r="50" />
        <circle cx="158" cy="50" r="50" />
        <circle cx="337" cy="-28" r="16" />
      </g>
      <g fill="var(--color-ink)">
        <circle cx="66" cy="50" r="21" />
        <circle cx="174" cy="50" r="21" />
      </g>
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
      <g fill="var(--color-accent)">
        <circle cx="50" cy="50" r="50" />
        <circle cx="158" cy="50" r="50" />
      </g>
      <g fill="var(--color-ink)">
        <circle cx="66" cy="50" r="21" />
        <circle cx="174" cy="50" r="21" />
      </g>
    </svg>
  );
}
