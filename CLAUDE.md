# CLAUDE.md

Guidance for Claude Code working in this repository.

## What this is

Videa: a movie and TV discovery and playback site. Search by name, open a title,
press play. TMDB supplies metadata, VidFast supplies the embed, and everything
personal lives in LocalStorage. No database, no accounts, no server-side user
state.

Next.js 15 App Router, React 19, TypeScript strict, Tailwind v4. Deploys to
Vercel.

## Commands

```bash
npm run dev          # dev server
npm run build        # production build, also the real typecheck of route types
npm run typecheck    # tsc --noEmit
node scripts/export-logo.mjs   # regenerate icons from the logo SVG
```

Requires `TMDB_API_KEY` in `.env.local`. Copy `.env.example`. The app throws
`ConfigError` at request time if the key is missing, deliberately, so a
misconfigured deploy fails loudly instead of prerendering and caching an error
page.

## Architecture rules

These are the invariants. Breaking them is what makes this codebase decay.

**Raw TMDB shapes stop at `src/lib/tmdb.ts`.** Every function there returns a
normalized type from `src/lib/types.ts`. Never let a snake_case TMDB field reach
a component. If you need a new field, add it to the normalizer.

**`src/lib/playback.ts` is the only file that knows the provider exists.** It
owns the base URL, the path shape, and the origins trusted for player
`postMessage`. `VideoPlayer` receives intent (type, ids, season, episode) and
asks that module for a URL. Swapping providers should touch one file.

**IDs are implementation details.** TMDB ids drive routes. IMDb ids are resolved
from TMDB when a title opens and preferred for playback, with the TMDB id as
fallback (`playbackId()`). Neither is ever shown to a viewer.

**LocalStorage stores stubs, never payloads.** `MediaStub` is the widest shape
allowed in persisted state; narrow with `toStub()` before writing and widen with
`fromStub()` to reuse card components. Every read and write in `storage.ts` is
guarded, so private mode and quota-exceeded degrade to empty rather than throwing
into a render. The key is `videa-app-state`.

**Never invent playback progress.** The embed is cross-origin. Progress is only
stored when the player actually reports a position via `postMessage`
(`PlaybackRecorder`). When it does not, the title still lands in Continue
Watching with `progress: null` and renders no bar. Do not substitute a
plausible-looking percentage.

**Scroll:** no `window.addEventListener("scroll")`. The header's opaque state
comes from an `IntersectionObserver` on a sentinel in `layout.tsx`.

## Design system

Tokens live in `src/app/globals.css` under `@theme`. Use them; do not hardcode
hex values in components.

Light theme, locked. `color-scheme: light`, one theme for the whole page, no
section inverts. This is a deliberate override of the usual dual-mode default,
requested explicitly. The token layer is inversion-safe (`bg-ink` is the page
ground, `bg-fg text-ink` is the inverted button), so adding a dark variant means
redefining tokens in one block, not touching components.

**Palette.** A five-stop brand ramp plus one solid accent, all from the same
family so the page reads as one palette.

| Token | Value | Role |
| --- | --- | --- |
| `--color-g1` .. `--color-g5` | `#FFB627` `#FF6B3D` `#ED2E7E` `#A42FC1` `#4739D9` | Brand ramp |
| `--color-accent` | `#E0552B` | Signal only: rating star, focus ring, saved state |
| `--color-ink` | `#F5F6F8` | Page ground |
| `--color-fg` / `-2` / `-3` | `#111318` `#454C5A` `#5F6675` | Text |

`--color-fg-3` is `#5F6675` rather than something lighter because `.meta` renders
at 11px and needs to clear WCAG AA against the ground. Do not lighten it.

**The brand gradient has exactly four sanctioned placements:** the logo lockup,
the active nav indicator, the Continue Watching progress fill, and the ambient
`brand-wash` behind the hero seam and page headers. Adding a fifth turns a brand
into confetti.

**Radius, one system:** `--radius-card` 12px for surfaces (cards, posters,
inputs, buttons, panels), `--radius-mini` 6px for micro-surfaces under 48px, and
full round only for circular icon affordances such as the play disc.

**Type, three faces with distinct jobs:** Bricolage Grotesque for display
(`.display`), Instrument Sans for text, JetBrains Mono for data (`.meta`, years,
runtimes, episode codes, ratings). All via `next/font`.

**Primary CTAs are `bg-fg text-ink`.** Never add a lightening hover to them on
this theme; that is how you get white text on a white fill. They lift
(`hover:-translate-y-px hover:shadow-lift`) instead.

**Text on artwork stays white over `scrim-media`.** Image legibility is not a
page-theme decision. Text below artwork uses `text-fg`. Do not use `.meta` on
top of an image, since its colour is tuned for the page ground.

Motion is CSS only and collapses entirely under `prefers-reduced-motion`.

## Logo

Source of truth is `logos/iterations/iteration-5.svg` (lockup) and
`logos/iterations/mark-ramp.svg` (square mark). `logos/preview.html` shows the
concept and iteration history.

`components/Wordmark.tsx` inlines the lockup. Letterforms are paths, not text,
because the display face is not a system font and a font reference would mean
the logo silently renders in a fallback somewhere. The gradient is defined once
in `layout.tsx` as `#videa-ramp`, because `Wordmark` renders three times per page
and duplicate gradient ids are invalid markup.

Favicon and app icon use the Next file conventions `src/app/icon.svg` and
`src/app/apple-icon.png`. Regenerate with `node scripts/export-logo.mjs`.

The mark is a continuous gradient rather than five discrete bands on purpose. At
16px, banded gaps fall below one device pixel and alias into a smudge.

## Gotchas already paid for

**`scroll-snap-align: start` cancels a rail's `padding-inline`.** The snap
position aligns the first card to the scrollport edge, eating the gutter. The
`rail-gutter` utility fixes it by matching `scroll-padding-inline` to
`padding-inline`, and its `max()` keeps rails aligned with the page container
above 1440px. Use `rail rail-gutter` on any bleed rail, never bare `px-*`.

**`getBBox()` is not the path's control-point extents.** Quadratic control points
sit outside the curve they describe, so eyeballing centre coordinates from path
data is wrong. Measure.

**Dev-mode image optimization is slow.** Posters below the fold can take several
seconds on first paint. Blank poster boxes in dev are usually this, not a bug.
Check `img.currentSrc` (the real chosen size) rather than `img.src`, which holds
Next's largest-candidate fallback and always looks like a perf bug.

**A right-pointing triangle is left-heavy.** Geometric centring reads
off-centre; the play mark carries a deliberate optical nudge right.

## Attribution

This product uses the TMDB API but is not endorsed or certified by TMDB.
