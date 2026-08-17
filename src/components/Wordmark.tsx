/**
 * The Videa lockup, inlined so it stays crisp and inherits text colour.
 *
 * Artwork source of truth is logos/iterations/iteration-5.svg. The viewBox is
 * cropped tight to the artwork, so the height utility alone controls the size.
 *
 * The letterforms are drawn as paths rather than set in a font: the display
 * face is not a system font, and referencing an external one would mean the
 * logo silently renders in a fallback somewhere.
 *
 * The gradient lives once in `layout.tsx` under the id `videa-ramp`, because
 * this renders three times on a page (header, mobile drawer, footer) and
 * repeating a `<linearGradient id>` would be invalid markup.
 */
export function Wordmark({ className = "h-7 w-auto" }: { className?: string }) {
  return (
    <svg
      viewBox="152 168 711 176"
      className={className}
      role="img"
      aria-label="Videa"
    >
      <path
        id="videa-mark"
        d="M163.79 177.27 L252.21 246.73 Q264 256 252.21 265.27 L163.79 334.73 Q152 344 152 329 L152 183 Q152 168 163.79 177.27 Z"
        fill="url(#videa-ramp)"
      />
      <g
        id="videa-wordmark"
        transform="translate(322 192) scale(1.28)"
        fill="currentColor"
      >
        <path d="M0 0 H24 L44 68 L64 0 H88 L55 100 H33 Z" />
        <path transform="translate(102 0)" d="M0 0 H22 V100 H0 Z" />
        <path
          transform="translate(138 0)"
          fillRule="evenodd"
          d="M0 0 H46 C72 0 88 22 88 50 C88 78 72 100 46 100 H0 Z M22 22 V78 H44 C58 78 66 66 66 50 C66 34 58 22 44 22 Z"
        />
        <path
          transform="translate(240 0)"
          d="M0 0 H80 V22 H22 V39 H70 V61 H22 V78 H80 V100 H0 Z"
        />
        <path
          transform="translate(334 0)"
          fillRule="evenodd"
          d="M34 0 H54 L88 100 H64 L57 79 H31 L24 100 H0 Z M44 20 L53 57 H35 Z"
        />
      </g>
    </svg>
  );
}
