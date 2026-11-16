"use client";

import { blink } from "@/components/LogoEyes";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ArrowClockwise, UsersThree } from "@phosphor-icons/react";
import { PARTY_SERVER_ID, SERVERS, playbackUrl, type PlaybackRequest } from "@/lib/playback";
import { WatchParty } from "./WatchParty";
import type { MediaType } from "@/lib/types";

type Props = {
  type: MediaType;
  /** Both ids are passed in; the provider layer decides which one to use. */
  imdbId: string | null;
  tmdbId: number;
  season?: number;
  episode?: number;
  title: string;
  /** Esc goes here: the title page. */
  backHref: string;
  /** N goes here, when there is a next episode. */
  nextHref?: string;
};

/** The viewer's last pick, so the next episode opens on the server that worked. */
const SERVER_KEY = "oovi-server";

/**
 * Responsive 16:9 provider embed with a server switcher. Source URLs are built
 * by `lib/playback`, so adding or swapping providers does not touch this file.
 *
 * The iframe is keyed on the server and the retry counter alone, so metadata
 * changing around the player never restarts playback.
 */
export function VideoPlayer({
  type,
  imdbId,
  tmdbId,
  season,
  episode,
  title,
  backHref,
  nextHref,
}: Props) {
  const router = useRouter();
  const [serverId, setServerId] = useState(SERVERS[0]!.id);
  const [attempt, setAttempt] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const frameRef = useRef<HTMLIFrameElement>(null);
  /* ?party=<id> joins a room. Read from the address after mount rather than
     useSearchParams, so the page needs no Suspense boundary for it. */
  const [partyId, setPartyId] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("party");
    if (id && /^[a-z0-9]{10}$/.test(id)) setPartyId(id);
  }, []);

  const startParty = async () => {
    setStarting(true);
    try {
      const res = await fetch("/api/party", { method: "POST" });
      if (!res.ok) throw new Error();
      const { id } = (await res.json()) as { id: string };
      const url = new URL(window.location.href);
      url.searchParams.set("party", id);
      window.history.replaceState(null, "", url);
      setPartyId(id);
      setLoaded(false);
    } catch {
      /* Room could not be created; the button stays for another try. */
    } finally {
      setStarting(false);
    }
  };

  /* Read after mount: the server render cannot know it, and a guarded read
     keeps private mode from throwing into the render. */
  useEffect(() => {
    try {
      const saved = localStorage.getItem(SERVER_KEY);
      if (saved && SERVERS.some((s) => s.id === saved)) setServerId(saved);
    } catch {
      /* Storage unavailable: stay on the default server. */
    }
  }, []);

  const choose = (id: string) => {
    if (id === serverId) return;
    setServerId(id);
    setLoaded(false);
    try {
      localStorage.setItem(SERVER_KEY, id);
    } catch {
      /* Not remembered; the switch itself still works. */
    }
  };

  /*
   * N next episode, S next server, Esc back. Only while the page has focus:
   * keys pressed inside the cross-origin player never reach this document.
   */
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.repeat || event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) return;
      const el = event.target as HTMLElement | null;
      if (el?.closest("input, textarea, select, [contenteditable=''], [contenteditable='true']")) return;
      /* Something else (a dialog, the search dropdown) already handled it. */
      if (event.defaultPrevented || document.querySelector("dialog[open]")) return;

      const key = event.key.toLowerCase();
      if (key === "n" && nextHref) router.push(nextHref);
      else if (key === "s" && SERVERS.length > 1 && !partyId) {
        const index = SERVERS.findIndex((s) => s.id === serverId);
        choose(SERVERS[(index + 1) % SERVERS.length]!.id);
      } else if (key === "escape") router.push(backHref);
      else return;
      event.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const req: PlaybackRequest =
    type === "movie"
      ? { type: "movie", imdbId, tmdbId }
      : { type: "tv", imdbId, tmdbId, season: season ?? 1, episode: episode ?? 1 };
  /* A party always plays on the one server that reports and takes commands. */
  const activeServer = partyId ? PARTY_SERVER_ID : serverId;
  const src = playbackUrl(req, activeServer);

  return (
    <div>
      {/* Letterbox backing: wants the darkest surface, which is the ground. */}
      <div className="relative aspect-video w-full overflow-hidden rounded-card bg-ink shadow-lift">
        {!loaded && (
          <div className="skeleton absolute inset-0" aria-hidden="true" />
        )}
        <iframe
          ref={frameRef}
          key={`${activeServer}-${attempt}`}
          src={src}
          title={`${title} player`}
          onLoad={() => {
            setLoaded(true);
            /* The logo's eyes blink as the picture arrives. */
            blink();
          }}
          allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
          allowFullScreen
          referrerPolicy="origin"
          className="absolute inset-0 h-full w-full border-0"
        />
      </div>

      {/* One glass bar: which server, a hint for when it fails, and reload.
          Servers are numbered, never named; the provider is not the viewer's
          concern. Radii nest: card 16, minus 8 padding, is the 8px group,
          minus 4 is each 4px button. */}
      <div className="glass mt-4 flex items-center gap-3 rounded-card p-2 pl-4">
        {/* In a party the server is fixed, so the room takes the picker's place. */}
        {partyId && <WatchParty roomId={partyId} frameRef={frameRef} />}
        {SERVERS.length > 1 && !partyId && (
          <>
            <span className="eyebrow">Server</span>
            <div
              role="radiogroup"
              aria-label="Server"
              className="flex gap-1 rounded-mini bg-ink/60 p-1"
            >
              {SERVERS.map((server, index) => {
                const active = server.id === serverId;
                return (
                  <button
                    key={server.id}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    aria-label={`Server ${index + 1}`}
                    onClick={() => choose(server.id)}
                    className={`grid size-9 place-items-center rounded-[4px] font-mono text-sm tabular-nums transition-colors duration-200 ${
                      active ? "bg-fg text-ink" : "text-fg-3 hover:bg-fg/10 hover:text-fg"
                    }`}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>
            <span className="hidden text-xs text-fg-3 lg:inline">
              Not playing? Try another server
            </span>
          </>
        )}

        {!partyId && (
          <button
            type="button"
            onClick={startParty}
            disabled={starting}
            className="ml-auto inline-flex h-9 items-center gap-2 rounded-full px-3 text-sm text-fg-2 transition-colors duration-200 hover:bg-fg/10 hover:text-fg disabled:opacity-60 sm:px-4"
          >
            <UsersThree className="size-4" aria-hidden="true" />
            <span className="sr-only sm:not-sr-only">
              {starting ? "Starting" : "Watch together"}
            </span>
          </button>
        )}

        <button
          type="button"
          onClick={() => {
            setLoaded(false);
            setAttempt((n) => n + 1);
          }}
          /* "Watch together" (or the room) already takes the free space. */
          className="inline-flex h-9 items-center gap-2 rounded-full px-3 text-sm text-fg-2 transition-colors duration-200 hover:bg-fg/10 hover:text-fg sm:px-4"
        >
          <ArrowClockwise className="size-4" aria-hidden="true" />
          <span className="sr-only sm:not-sr-only">Reload</span>
        </button>
      </div>

      {/* Keyboards live on md and up; a phone has nothing to press. */}
      <p className="mt-3 hidden flex-wrap items-center gap-x-4 gap-y-2 text-xs text-fg-3 md:flex">
        {nextHref && (
          <span className="inline-flex items-center gap-1.5">
            <Key>N</Key> Next episode
          </span>
        )}
        {SERVERS.length > 1 && !partyId && (
          <span className="inline-flex items-center gap-1.5">
            <Key>S</Key> Switch server
          </span>
        )}
        <span className="inline-flex items-center gap-1.5">
          <Key>Esc</Key> Back to title
        </span>
      </p>
    </div>
  );
}

/* Same keycap as the search dropdown's. */
function Key({ children }: { children: ReactNode }) {
  return (
    <kbd className="grid h-5 min-w-5 place-items-center rounded-[4px] border border-line-strong px-1 font-mono text-[11px] leading-none text-fg-2">
      {children}
    </kbd>
  );
}
