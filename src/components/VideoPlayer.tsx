"use client";

import { useEffect, useState } from "react";
import { ArrowClockwise } from "@phosphor-icons/react";
import { SERVERS, playbackUrl, type PlaybackRequest } from "@/lib/playback";
import type { MediaType } from "@/lib/types";

type Props = {
  type: MediaType;
  /** Both ids are passed in; the provider layer decides which one to use. */
  imdbId: string | null;
  tmdbId: number;
  season?: number;
  episode?: number;
  title: string;
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
}: Props) {
  const [serverId, setServerId] = useState(SERVERS[0]!.id);
  const [attempt, setAttempt] = useState(0);
  const [loaded, setLoaded] = useState(false);

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

  const req: PlaybackRequest =
    type === "movie"
      ? { type: "movie", imdbId, tmdbId }
      : { type: "tv", imdbId, tmdbId, season: season ?? 1, episode: episode ?? 1 };
  const src = playbackUrl(req, serverId);

  return (
    <div>
      {/* Letterbox backing: wants the darkest surface, which is the ground. */}
      <div className="relative aspect-video w-full overflow-hidden rounded-card bg-ink shadow-lift">
        {!loaded && (
          <div className="skeleton absolute inset-0" aria-hidden="true" />
        )}
        <iframe
          key={`${serverId}-${attempt}`}
          src={src}
          title={`${title} player`}
          onLoad={() => setLoaded(true)}
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
        {SERVERS.length > 1 && (
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

        <button
          type="button"
          onClick={() => {
            setLoaded(false);
            setAttempt((n) => n + 1);
          }}
          className="ml-auto inline-flex h-9 items-center gap-2 rounded-full px-3 text-sm text-fg-2 transition-colors duration-200 hover:bg-fg/10 hover:text-fg sm:px-4"
        >
          <ArrowClockwise className="size-4" aria-hidden="true" />
          <span className="sr-only sm:not-sr-only">Reload</span>
        </button>
      </div>
    </div>
  );
}
