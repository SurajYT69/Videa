# Videa

A movie and TV discovery and playback site. Search by name, open a title, press
play. TMDB provides metadata, VidFast provides the embed, and everything
personal lives in LocalStorage.

## Setup

```bash
npm install
cp .env.example .env.local   # add your TMDB v3 API key
npm run dev
```

A free TMDB key comes from https://www.themoviedb.org/settings/api. The key is
read server-side only; it is never sent to the browser. The app throws at
startup if `TMDB_API_KEY` is missing, rather than shipping a broken catalogue.

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Hero, trending, popular, personal rails |
| `/movie`, `/tv` | Browse by type |
| `/movie/[id]`, `/tv/[id]` | Title details, cast, seasons, recommendations |
| `/search?q=` | Full search results |
| `/watch/movie/[id]` | Movie playback |
| `/watch/tv/[id]/[season]/[episode]` | Episode playback |
| `/my-list` | Continue watching, favorites, history |

## Architecture

```
src/lib/tmdb.ts       All TMDB access. Raw response shapes stop here.
src/lib/types.ts      MediaItem and friends: the internal source of truth.
src/lib/playback.ts   Provider URL construction. Swap providers here only.
src/lib/storage.ts    LocalStorage, guarded. No database, no accounts.
src/app/api/*         Thin route handlers so the client can query without the key.
src/components/*      One concern per file.
```

Ids are an implementation detail. TMDB ids drive the routes; IMDb ids are
resolved from TMDB when a title is opened and preferred for playback, with the
TMDB id as the fallback. Neither is ever shown to the viewer.

### Playback provider

`src/lib/playback.ts` is the only file that knows the provider exists. It owns
the base URL, the path shape, and the list of origins trusted for player
messages. `VideoPlayer` receives intent (type, ids, season, episode) and asks
that module for a URL.

### Progress

The embed is cross-origin, so playback position is only recorded when the
player reports one via `postMessage`. When it does not, the title still appears
in Continue Watching, without a progress bar. No percentage is ever invented.

## Design system

Tokens live in `src/app/globals.css` under `@theme`.

- Ground `#080808`, surface `#111111`, raised `#171717`
- Text `#F5F5F5` / `#A5A5A5` / `#707070`
- One accent, `#E7B24B`, used only as signal: ratings, focus rings, progress,
  active state. It is never a button fill.
- Radius: `8px` for every surface (cards, posters, inputs, buttons, panels),
  `4px` for micro-surfaces under 48px (search thumbnails, skeleton text bars),
  and full-round only for circular icon affordances such as the play button.
- Geist for text, Geist Mono for metadata and numbers.
- Motion is CSS-only and collapses entirely under `prefers-reduced-motion`.

## Deploying

Vercel, with `TMDB_API_KEY` and `NEXT_PUBLIC_SITE_URL` set as environment
variables. Discovery pages revalidate every three hours; detail pages are
rendered on demand and cached per title.

## Attribution

This product uses the TMDB API but is not endorsed or certified by TMDB.
