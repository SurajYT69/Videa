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
npm run dev          # dev server, Turbopack
npm run build        # production build, also the real typecheck of route types
npm run typecheck    # tsc --noEmit
node scripts/export-logo.mjs   # regenerate icons from the logo SVG
```

Dev runs on Turbopack because per-route compilation is the single biggest
source of perceived slowness in development: on webpack, the first click into
`/movie/[id]` cost 3.1s of compile before any request work started, and the
homepage cost 9.4s. Turbopack brings those to roughly 0.8s and 15s-once. Judge
performance from `npm run build && npm start`, never from dev.

To profile honestly, wipe both caches first — `.next/cache/images` and
`.next/cache/fetch-cache` — with the server stopped, or you will measure cache
hits and conclude everything is fine. To count what actually leaves the process,
wrap `globalThis.fetch` in a file outside `src/` and load it with
`NODE_OPTIONS=--require ./tap.cjs`: it sits below Next's data cache, so it logs
real network calls only, and the app source stays untouched. That is how the
"is TMDB fetched twice?" question was settled (it is not — one cold movie page
makes exactly four calls).

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

**IDs are implementation details.** TMDB ids drive routes. IMDb ids are preferred
for playback, with the TMDB id as fallback (`playbackId()`). Neither is ever
shown to a viewer.

**IMDb resolution must never cost a request.** `getMovie` and `getTV` carry
`append_to_response`, so the IMDb id arrives on the details response that the
page already needs. There is deliberately no `getExternalIds` helper: adding one
would invite a second serial round trip on the navigation critical path, which
is precisely the waterfall that made opening a title feel slow.

**Secondary data streams; critical data does not.** A details page awaits only
the one call that produces its title, artwork, overview and Watch button.
Recommendations, episode lists and anything else live behind `<Suspense>` in
their own async component and arrive when they arrive. The rule of thumb: if a
section would still make sense appearing half a second late, it does not belong
in the page's top-level `await`.

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
| `--color-ink-2` | `#EDEFF4` | Recessed section band |
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

Display sizing comes from three fluid steps, not from ad-hoc `text-*` chains:
`.display-hero` for the homepage hero, `.display-page` for page and title
openers, `.display-section` for section headings. Each is a `clamp()`, so 390px
and 1440px are the same rule rather than two guesses.

`.meta` is data on the page ground. `.eyebrow` is the wider-tracked category
marker above a section or title heading; it never sits on artwork either.

**Sections are told apart by rhythm and ground, not by boxes.** `Section` draws
a hairline above its heading and takes `tone="band"` to sit on `--color-ink-2`.
Alternate it down a page so the scroll reads as stacked chapters. Do not wrap
sections in cards, and do not give every section the same eyebrow-plus-lead
treatment — the lead line is for the one or two sections that earn it.

**Primary CTAs are `bg-fg text-ink`.** Never add a lightening hover to them on
this theme; that is how you get white text on a white fill. They lift
(`hover:-translate-y-px hover:shadow-lift`) instead.

**Text on artwork stays white over `scrim-media`.** Image legibility is not a
page-theme decision. Text below artwork uses `text-fg`. Do not use `.meta` on
top of an image, since its colour is tuned for the page ground.

**Three card shapes, one language.** `MediaCard` (2:3 poster, title and meta
below) for grids and poster rails; `TrendingRail`'s card (16:9, ranked, title on
the artwork) for trending; `ContinueWatchingCard` (16:9, centred play disc,
progress hairline) for resume. They share radius, hover physics and type, and
differ in proportion and what sits on the image. Do not collapse them into one
component, and do not add a fourth without a proportion that earns it.

Hover is the same everywhere: card lifts 4px, image scales ~1.05, one action
affordance fades in, shadow goes to `shadow-lift`. Posters carry no resting
shadow — eighteen of them in a grid reads as fog.

**Discovery on the homepage is horizontal.** Every homepage section is a single
scrolling row through `Rail`, never a grid. Three rows of posters made the page
read as a catalogue dump and forced the browser to fetch far more artwork before
the next section was reachable. Card widths are set so the next card is always
part-way into frame, which is what makes a rail legible as a rail: measured, that
is ~7 posters and ~3.2 landscape stills at 1440px, and ~2.1 posters and ~1.7
stills at 390px. `MediaGrid` still belongs on `/movie`, `/tv`, `/search` and
`My List`, where a grid is the point.

`Rail` owns the scroller, the desktop arrows and the containment. Its wrapper is
`overflow-x: clip` — see the gotcha below — and it takes an `aria-label` because
it renders a labelled scroll region. Arrows are desktop-only, appear on hover,
and go `aria-hidden` plus `pointer-events-none` at whichever end has run out.

**Hero height is capped on purpose.** `min-h-[520px]` on phones, and
`clamp(600px, 64dvh, 700px)` from `md` up. This is a composition rule, not a
taste one: TMDB backdrops are 16:9, and the taller the box, the more width
`object-cover` throws away, which is what slices through the actors. A shallower
box keeps the frame near the still's own proportions. `object-position` carries
two values for the same reason — wide frames bias right so the subject clears the
type column, narrow frames centre, because at 390px there is no far side to move
anyone to. Both sit high, since backdrops put faces in the upper third.

Motion is CSS only and collapses entirely under `prefers-reduced-motion`.

## Images

Artwork is the bulk of what this site ships, and the Next image optimizer is a
single process. It is the throughput ceiling on a cold cache, so these rules are
performance invariants, not preferences. All numbers below were measured against
`npm run build && npm start`.

**WebP only. Never re-enable AVIF.** Measured on this app's own image sets, 24
fresh images at six-way concurrency took ~2829ms as AVIF and ~1714ms as WebP,
with the format assignment swapped across pages to control for content. AVIF
encoding is what made a card click feel slow: with 46 unique optimized images on
the homepage, the queue is deep enough that the details page's backdrop lands
behind it. The ~25% byte saving AVIF would give back is not worth it here,
because every TMDB image is unique and the optimizer cache hit rate is low.

**`deviceSizes` stops at 1280 because no source is wider.** `BACKDROP.lg`
(`w1280`) is the widest thing this app ever requests from TMDB. The default
ladder's 1920 / 2048 / 3840 steps returned byte-identical output while still
costing a resize job. If you ever add an `original` source, raise the ceiling in
the same commit.

**Every `sizes` is measured, not guessed.** Open the component in the browser,
read the rendered width at 390 and at 1440, and write both into `sizes`. Never
`100vw` on anything that is not full-bleed, and never a bare fixed width that
ignores the phone. Current measured widths:

| Surface | 390px | 1440px |
| --- | ---: | ---: |
| Hero / detail backdrop | full-bleed | full-bleed |
| Trending still | 280 | 420 |
| Continue watching | 280 | 360 |
| Grid poster | ~170 | 206 |
| Rail poster | 148 | 184 |
| Episode still | 144 | 208 |
| Cast, recently viewed | 112 | 128 |

`imageSizes` carries extra 192 / 320 / 448 steps so those land near their box
instead of rounding up. After any change, verify no image requests more than
about 1.3× its rendered width.

**`priority` is for the LCP element and nothing else.** The hero backdrop and the
detail-page poster earn it. Rails do not, at any position: two eager trending
stills were competing with the hero for the optimizer and for Chrome's six
connections. Grids below a page header do not either — measured, `/movie`'s grid
starts around 1140px on a 900px-tall window. Everything else stays lazy, which is
Next's default, so the fix is usually to delete a prop rather than add one.

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

**A corner scrim only works when the frame has a far side.** `scrim-corner` is a
bottom-left radial on desktop, which keeps the type opaque and leaves the
subject clear. At 390px there is no far side: the radial lands directly on
whoever is in shot and the hero copy becomes unreadable. The utility therefore
ships a bottom-up linear scrim as its base and switches to the radial at
`min-width: 768px`. Check the hero at 390px before touching either.

**Do not stack a flat tint on top of a scrim.** `DetailBackdrop` used to carry
`bg-ink/25` across the whole frame in addition to its gradient. Two overlapping
washes turn a still into a faded print. One scrim, weighted where the type is.

**`getBBox()` is not the path's control-point extents.** Quadratic control points
sit outside the curve they describe, so eyeballing centre coordinates from path
data is wrong. Measure.

**A scroll container leaks its width to its ancestors.** Every rail reported its
full `scrollWidth` all the way up to `<main>`: 3671px inside a 1440px viewport.
`body { overflow-x: hidden }` hid the symptom, because `overflow: hidden` blocks
the user from scrolling but not `scrollTo()` or a `focus()` on an off-screen
card — the page really did move 567px. `Rail`'s wrapper is `overflow-x: clip`,
which contains it without creating a second scroll container. If you build
another horizontal scroller, do the same, and check
`document.documentElement.scrollWidth` equals `clientWidth` before calling it
done.

**Dev-mode image optimization is slow.** Posters below the fold can take several
seconds on first paint. Blank poster boxes in dev are usually this, not a bug.
Check `img.currentSrc` (the real chosen size) rather than `img.src`, which holds
Next's largest-candidate fallback and always looks like a perf bug.

**`currentSrc` lies after a resize, and `naturalWidth` lies during decode.**
Chrome keeps an already-cached larger candidate rather than downgrading when the
viewport shrinks, so resizing the window and re-reading `currentSrc` reports the
desktop pick at phone widths. Reload with cache disabled before trusting any
image audit. `naturalWidth` on a `fill` image can also report the layout size
mid-decode; to check what was really delivered, fetch the `/_next/image` URL and
read the header.

**A right-pointing triangle is left-heavy.** Geometric centring reads
off-centre; the play mark carries a deliberate optical nudge right.

## Attribution

This product uses the TMDB API but is not endorsed or certified by TMDB.
