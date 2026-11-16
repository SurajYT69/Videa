# CLAUDE.md

Guidance for Claude Code working in this repository.

## What this is

oovi: a movie and TV discovery and playback site. It was called Videa; the
repo folder, the package name and the LocalStorage key keep the old name. Search by name, open a title,
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

Providers are entries in `SERVERS` there; the first is the default. `VideoPlayer`
shows a server switcher once there are two, and remembers the viewer's pick
under its own LocalStorage key, `oovi-server` (a plain id, guarded like the
rest). `PLAYER_ORIGINS` is every server's trusted origins together.

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
into a render. The key is `videa-app-state`; it kept the old name through the rename so saved
lists survive.

**Never invent playback progress.** The embed is cross-origin. Progress is only
stored when the player actually reports a position via `postMessage`
(`PlaybackRecorder`). When it does not, the title still lands in Continue
Watching with `progress: null` and renders no bar. Do not substitute a
plausible-looking percentage.

**Scroll:** no `window.addEventListener("scroll")`. The phone bar's opaque state
comes from an `IntersectionObserver` on a sentinel in `layout.tsx`. The desktop
rail has no scroll state at all.

## Design system

Tokens live in `src/app/globals.css` under `@theme`. Use them; do not hardcode
hex values in components.

Dark by default, with a light mode the viewer chooses. One theme for the
whole page, no section inverts. The mode lives in `data-mode` on `<html>`
(`dark` from the server); `ThemeSwitch` (rail and phone header) renders the
vendored 000h toggle from `components/ui/theme-toggle.tsx` for its button and
sun/moon morph, runs its own reveal, and saves the mode under `oovi-theme`.
The reveal is transform and opacity only, by measurement: the library's
clip-path reveal ran on the main thread at ~30fps in Chrome 151. A blob of the
new ground grows from the toggle, the mode flips while it covers the page
(with `data-theme-switching` suspending every transition, or hundreds of
`transition-colors` elements animate at once), then the blob fades. The
toggle's jelly outline and click ripple are off (`data-morph="none"`,
`data-flow="off"`): they wrote the button's transform every frame of the
reveal. A
script in `layout.tsx` restores a saved light choice before first paint. There
is deliberately no `prefers-color-scheme` variant and `dark:` utilities have no
meaning here: components use tokens, and `:root[data-mode="light"]` in
`globals.css` swaps the ramp. The light accent is `#5B7A00`, because lime on
white is about 1.2:1; the logo keeps its lime in both modes via `--color-mark`.
Anything that hardcodes a dark-only colour needs a light override in the block
at the end of `globals.css` (see "What was not inversion-safe").

The theme was converted from a locked light theme, and the token layer mostly
held up: the palette below is a drop-in replacement and the great majority of
components needed no edit, because `bg-ink` is the page ground and
`bg-fg text-ink` is the inverted pair. Mostly is not entirely — the seven
things that did not survive inversion are recorded under "Gotchas already paid
for", and they are the list to check first if the theme is ever changed again.

**Palette.** One neutral ramp and one solid accent. Artwork carries the colour;
the chrome does not.

| Token | Value | Role |
| --- | --- | --- |
| `--color-accent` | `#C8F031` | Logo mark, playhead, rating star, focus ring, saved state |
| `--color-accent-soft` | `#1E2410` | Accent-tinted surface behind `text-accent` |
| `--color-ink` | `#0B0C0E` | Page ground |
| `--color-ink-2` | `#121316` | Section band — one step *lighter* than the ground |
| `--color-surface` / `--color-raised` | `#15171A` `#1D1F23` | Resting / elevated surface |
| `--color-line` / `-strong` | `#25282D` `#383C43` | Hairline / hairline on raised |
| `--color-fg` / `-2` / `-3` | `#F4F5F0` `#BABCBA` `#989B98` | Text |

Every value was recomputed against the new grounds, not inverted from the old
ones. `--color-fg-3` carries `.meta` and `.eyebrow` at 12px and comes to roughly 6.9:1 on the ground, 6.6:1 on the band, 6.3:1 on a surface and 5.8:1 on a raised
one (computed from the hex values for the oovi palette, not measured in a browser). It sits above the light theme's 5.33:1 deliberately: light-on-dark blooms
optically at small sizes and the headroom pays for that. Do not darken it.

`--color-ink-2` going *lighter* than the ground is the one inversion that is
not symmetric. On dark, receding means coming forward; flip it darker and the
alternating sections stop reading as separate chapters.

The accent is acid lime. It replaced the orange when the product became oovi,
and the surface ramp went from blue-tinted to neutral at the same time so the
lime is the only colour in the chrome. It comes to roughly 15:1 on the ground.

**No hue-to-hue gradients, anywhere.** The five-stop brand ramp, `brand-bar`,
`brand-wash` and the gradient logo were removed on purpose. The accent appears
as a short tick that means "you are here": on the rail's edge beside the active
destination, before every section heading, as the Continue Watching progress
fill, and under the episode a viewer stopped on.

**Radius, one system:** `--radius-card` 16px for surfaces (cards, posters,
panels, tiles), `--radius-mini` 8px for chips and small thumbnails, and full
round for buttons, the search field, filter pills and icon affordances.

**Type, three faces with distinct jobs:** Bricolage Grotesque for display
(`.display`), Instrument Sans for text, JetBrains Mono for data (`.meta`, years,
runtimes, episode codes, ratings). All via `next/font`.

Display sizing comes from three fluid steps, not from ad-hoc `text-*` chains:
`.display-hero` for the homepage hero, `.display-page` for page and title
openers, `.display-section` for section headings. Each is a `clamp()`, so 390px
and 1440px are the same rule rather than two guesses.

`.meta` is data on the page ground, sentence case at 12px. `.eyebrow` is the
small uppercase tracked label (11px, 0.12em): the kind marker above a title,
"Streaming on", fact-tile labels and footer headings. It came back with the
layout rebuild because the reference layout depends on it; keep it to labels of
that kind and never use it for running text.

Tight tracking is opt-in. `.display` is weight 500 with zero tracking, and only
`.display-hero` and `.display-page` set `--display-tracking` negative.

**Sections are told apart by rhythm and ground, not by boxes.** `Section` opens
with a heading carrying the accent tick and takes `tone="band"` to sit on `--color-ink-2`.
Alternate it down a page so the scroll reads as stacked chapters. Band sections run under the rail (`md:-ml-18 md:pl-18`) so the ground change
reaches the left edge. Do not wrap sections in cards, and do not bring back
section eyebrows — `Section` has no such prop. The lead
line is for the one or two sections that earn it.

**Primary CTAs are `bg-fg text-ink`.** On this theme that is a near-white fill
with dark text. Never add a hover that moves the fill toward the text colour —
on light that meant no lightening hover, and on dark it means no darkening one;
either way you end up with the label dissolving into its own button. They lift
(`hover:-translate-y-px hover:shadow-lift`) instead.

The same pair does the play discs on artwork (`MediaCard`, `TrendingRail`,
`EpisodeCard`, `ContinueWatchingCard`). Those used to be a hardcoded `bg-white
text-fg`, which is the one thing that cannot survive an inversion.

**Text on artwork stays white over `scrim-media`.** Image legibility is not a
page-theme decision. Text below artwork uses `text-fg`. Do not use `.meta` on
top of an image, since its colour is tuned for the page ground.

**Three card shapes, one language.** `MediaCard` (2:3 poster, title and meta
below) for grids and poster rails; `TrendingRail`'s card (16:9, ranked, title on
the artwork) for trending; `ContinueWatchingCard` (16:9, centred play disc,
progress hairline) for resume. They share radius, hover physics and type, and
differ in proportion and what sits on the image. `Top10Rail` (homepage
"Trending this week") is the poster shape with a hollow rank numeral behind
its left edge, not a fourth card. Do not collapse them into one
component, and do not add a fourth without a proportion that earns it.

`MediaCard` is the exception: on hover a panel fades up over the poster with
the title, a play link, a save button (`CardSaveButton`) and year · genre. It
is a sibling of the card link, since buttons cannot nest in an anchor.

Hover is otherwise the same everywhere: one action affordance fades in and the shadow
goes to `shadow-lift`. Cards do not lift and artwork does not zoom. Posters carry no resting
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

**Hero height follows the backdrop, not the viewport.** `min-h-[520px]` on
phones, and `clamp(600px, min(88dvh, 56.25vw), 960px)` from `md` up, on the
home slider, section sliders and title pages alike. 56.25vw is the height of a
16:9 still at full width: up to there `object-cover` only trims top and bottom,
and past it it starts cutting the sides, which is what slices through the
actors. So the hero grows with the screen and stops exactly where cropping
would begin. `object-position` carries
two values for the same reason — wide frames bias right so the subject clears the
type column, narrow frames centre, because at 390px there is no far side to move
anyone to. Both sit high, since backdrops put faces in the upper third.

Motion is CSS only and collapses entirely under `prefers-reduced-motion`.

## Layout

The layout was rebuilt against a set of reference screenshots the owner
supplied (another product's home, title, discover, shelf and player screens).
Structure and treatment follow that reference closely; name, logo, colours and
type are oovi's own.

**Shell.** From `md` up, navigation is a 72px icon rail (`Header.tsx`), fixed
on the left and transparent over artwork. `layout.tsx` pads everything else
with `md:pl-18`; heroes and band sections break back out with `md:-ml-18` and
pad their content in again. Search sits top-centre in the page flow and scrolls
away; the rail's search icon and Ctrl+K are always available. Below `md` it is
a top bar (logo, theme, search) plus a floating glass capsule of tabs (Home,
Movies, TV, Anime, My List); there is no drawer. The active tab widens into a
`bg-fg` pill with its label; the rail's raised disc and accent tick slide
between items. Both are `motion` `layoutId`s on one critically damped spring
(`bounce: 0`, 0.35s) under `MotionConfig reducedMotion="user"`. Rail items show
a `glass-panel` label on hover. `layout.tsx` pads the page bottom to clear the
capsule.

**Title pages** open with `TitleHero`: backdrop edge to edge, the title's own
logo art when TMDB has one (typed title otherwise), a score ring and one facts
line, then the actions and a "Streaming on" row. There is no poster on the
page. Under it: the collection banner (films only, streamed), then fact tiles.

**Everything on a title page still comes from one request.** Logo, studios,
languages and providers ride on `append_to_response` (`images`,
`watch/providers`). Providers are read for India, then the US, and are shown
but never linked; the footer carries the JustWatch credit that requires.
`getCollection` is the one extra call and lives behind Suspense.

**Glass.** `glass` (light film) is for controls, chips and tiles; `glass-panel`
(dark film) is for anything that carries text over a still, including the
search field and the resume card. Blur is static, never animated.

**Ambient tint.** `AmbientTint` samples the hero image (`img[data-ambient]`)
through a canvas and sets `--ambient` on `<html>`; a fixed layer in
`layout.tsx` paints it. It is content colour, changes per title, and falls
back to nothing if sampling fails.

**Episodes** are one horizontal rail per selected season, cards 240px on phones
and 264px from `md`. The series hero shows a resume card on wide screens once
this browser has a last episode; it draws progress only when the player
reported one.

**Not built from the reference, on purpose:** profile, streak, watchlists and
lists (no accounts) and download. Hover lift and artwork zoom stay removed.

**Home** opens with `HeroCarousel`: up to five trending titles, auto-advancing
every 8s, paused on hover and focus, never under reduced motion. Changes run
left ("next"); going back is the only reversal. The outgoing copy accelerates
out before the incoming copy decelerates in on the same axis; the incoming
still slides in over the outgoing one, which stays opaque underneath. No Ken
Burns or idle motion. The active thumb's progress fill is the clock: its
`animationend` advances the slide, so pausing it pauses the countdown exactly.
Up-next thumbs (TMDB `w300`, `unoptimized`, kept out of the optimizer queue)
show from `md`; phones get bars and swipe. Only slide one
is `priority` and only it feeds the ambient tint. Below it, `NewEpisodes` (a
client component) asks `/api/airing` about the series this browser has saved
or started and shows episodes out in the last week or due in the next; it
renders nothing otherwise. Indian rails (Hindi films and series, Telugu, Tamil)
come from `DiscoverRail`, which is also what `/anime` uses.

**Every page opens on artwork.** `/movie`, `/tv` and `/anime` open with
`PageHero`: the homepage slider fed with that section's own trending or
popular titles, and the rail below skips the five it used. My List and the empty
search page have no single title, so `PosterWall` puts a tilted, dimmed wall of
this week's trending posters behind them. `PageHeader` is gone.

**More title-page data, still no extra request:** the trailer key rides on the
details call (`videos`); `TrailerButton` opens it in a native `<dialog>` and
only creates the YouTube iframe on open. `RatingsStrip` (IMDb, Rotten Tomatoes,
Metacritic from OMDb, `lib/omdb.ts`) is a second request behind Suspense,
cached a day, and needs `OMDB_API_KEY`. OMDb's terms are personal and
non-commercial; the free key allows 1,000 requests a day.

**People.** Cast cards link to `/person/[id]`: one request (`combined_credits`),
credits ordered by vote count, each title once.

**Browse filters** are `FilterDropdown` glass pills, not native selects: Genres
(multi), Language (`?lang=`, validated against `lib/tmdb-options.ts`), Year,
Rating, and Sort on the right. The dropdown is a button plus a listbox with
arrow-key, Enter and Escape handling, and closes on an outside click.

**Provider filter.** `/movie` and `/tv` show the top ten Indian streaming
services above the filter pills; one is selectable at a time and lives in the URL as
`?provider=`, matched with `watch_region=IN`.

**Anime this season** is MAL's seasonal list. MAL entries carry no TMDB id, so
those cards link to oovi's search for the English title rather than costing a
lookup each.

**Installable.** `src/app/manifest.ts` plus `public/icon-192.png` and
`public/icon-512.png` (written by `scripts/export-logo.mjs`). No service
worker; the Next.js PWA guide lists only a manifest and HTTPS.

**MyAnimeList** (`lib/mal.ts`) is optional and anime-only: a title counts as
anime when TMDB says Japanese-language animation. `MalPanel` searches MAL by
the title (then the original title) and keeps only a result with the same
start year and kind, so a sequel season never stands in for the show. It is a
second request behind Suspense, cached a day, and renders nothing without
`MAL_CLIENT_ID` or without a confident match. Only the Client ID is used; the
Client Secret is not needed for public data and must never be stored here.

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

**`deviceSizes` stops at 2560, and only the heroes go past 1280.** They also
render at `quality={90}`, against Next's default 75, because a full-screen
still bands in its dark gradients at 75. Zoomed and HiDPI screens are what
reach 2560. The home,
section and title-page heroes request TMDB's `original` still (`BACKDROP.xl`),
because w1280 stretched across a 1920px screen read as soft. Everything else
still requests at most `w1280` (`BACKDROP.lg`), so the 1920 step costs one
resize per page, for its LCP image. Do not point anything else at
`BACKDROP.xl` without measuring; originals can be 3840 wide and are the most
expensive thing the optimizer ever resizes.

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

**`priority` is for the LCP element and nothing else.** The home hero backdrop
and the title-page backdrop (`TitleHero`) earn it. Rails do not, at any position: two eager trending
stills were competing with the hero for the optimizer and for Chrome's six
connections. Grids below a page header do not either — measured, `/movie`'s grid
starts around 1140px on a 900px-tall window. Everything else stays lazy, which is
Next's default, so the fix is usually to delete a prop rather than add one.

## Logo

Source of truth is `logos/oovi/logo.svg` (wordmark) and `logos/oovi/mark.svg`
(square mark). Earlier rounds, including the Videa logo, are kept under
`logos/iterations/`, `logos/concepts*/` and `logos/names*/`.

The two o's are the eyes: accent discs with a pupil in the page ground, set
right of centre so they look toward the rest of the word. The wordmark has no
separate icon beside it; the square mark is the eyes alone.

`components/Wordmark.tsx` inlines the wordmark. Letterforms are shapes, not
text, so the logo can never render in a fallback font.

Favicon and app icon use the Next file conventions `src/app/icon.svg` and
`src/app/apple-icon.png`. Regenerate the PNGs with
`node scripts/export-logo.mjs`. `src/app/icon.svg` is a hand copy of
`logos/oovi/mark.svg`; the export script does not write it.

## Gotchas already paid for

**What was not inversion-safe.** Converting the locked light theme to a locked
dark one was mostly a token swap, but these did not come along for free. If the
palette is ever changed again, this is the checklist.

*Outside the token block entirely:*

- `html { color-scheme }` in `@layer base`, and the `viewport` export in
  `layout.tsx` (`themeColor`, `colorScheme`). A stale `themeColor` is a white
  flash on first paint on mobile, which no amount of correct CSS hides.
- The logo mark hardcodes the accent hex in `logos/oovi/*.svg` and
  `src/app/icon.svg`, because SVG files cannot read theme tokens, and `GROUND`
  in `scripts/export-logo.mjs` hardcodes the page ground. Both have to move in
  the same commit as `--color-accent` and `--color-ink`.

*Hardcoded colours inside utilities:*

- `skeleton` was a `#e9ecf1` base with a 72% white sweep. Left alone that is a
  strobe light on a dark grid of loading posters. Now `--color-surface`'s value
  with a 6% sweep.
- `art-edge` was a dark inset hairline, which is invisible against a dark
  ground. It has to invert to a light one — the job is separating artwork from
  the ground, and the ground changed sides.
- `::-webkit-scrollbar-thumb` and its hover, and the `::selection` text colour.
  Selection is the subtle one: the accent is light enough on this theme that
  white on it measures 2.59:1, so selected text takes `--color-ink` instead.

*Assumptions rather than hardcodes:*

- **Shadows stopped being the elevation.** A shadow can only darken, and there
  is very little room below `--color-ink` to darken into. Card separation moved
  into surface lightness and hairlines; the shadow tokens are now just the hover
  cue. Do not answer "the card looks flat" by raising the alpha again.
- **Four play discs paired a hardcoded `bg-white` with a themed `text-fg`.** On
  light that is a dark glyph on a white disc; invert `--color-fg` and it becomes
  a white glyph on a white disc. Now `bg-fg text-ink`, which is the same
  documented inverted pair the CTAs use.
- **`bg-fg` was being used to mean "the darkest thing available".** The mobile
  menu scrim (`Header`) and the player letterbox (`VideoPlayer`) both did this.
  It only ever read as dark because the foreground happened to be the dark end
  of the pair; both now take `bg-ink`, which is what they actually meant.

Everything else inverted for free, including every scrim built on
`var(--color-ink)`. `scrim-media` is deliberately exempt in both directions —
it is `rgb(10 12 16 / …)` because text on artwork is not a page-theme decision.

**`transition-colors` makes focus rings unmeasurable in a background tab.**
Reading `outlineColor` right after `.focus()` returns a value part-way between
`currentColor` and `--color-accent`, and a backgrounded tab throttles the
transition so it never finishes while you sample. It looks exactly like the
focus ring resolving to the wrong colour. Inject
`* { transition: none !important }` before measuring, or you will go hunting for
a cascade bug that is not there.

**`scroll-snap-align: start` cancels a rail's `padding-inline`.** The snap
position aligns the first card to the scrollport edge, eating the gutter. The
`rail-gutter` utility fixes it by matching `scroll-padding-inline` to
`padding-inline`, and its `max()` keeps rails aligned with the page container
above 1920px. Use `rail rail-gutter` on any bleed rail, never bare `px-*`.

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
