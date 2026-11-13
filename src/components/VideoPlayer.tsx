"use client";

import { useEffect, useState } from "react";
import { ArrowClockwise, WifiHigh } from "@phosphor-icons/react";
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

      {/* One glass bar: which server, a hint for when it fails, and reload. */}
      <div className="glass mt-4 flex flex-wrap items-center justify-between gap-x-6 gap-y-3 rounded-card p-2 pl-4">
        {SERVERS.length > 1 ? (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <span className="flex items-center gap-2">
              <WifiHigh className="size-4 text-accent" aria-hidden="true" />
              <span className="eyebrow">Server</span>
            </span>

            <div
              role="radiogroup"
              aria-label="Server"
              className="flex flex-wrap items-center gap-1 rounded-full bg-ink/60 p-1"
            >
              {SERVERS.map((server, index) => {
                const active = server.id === serverId;
                return (
                  <button
                    key={server.id}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => choose(server.id)}
                    className={`inline-flex items-center gap-2 rounded-full py-1.5 pr-4 pl-1.5 text-sm transition-colors duration-200 ${
                      active ? "bg-fg text-ink" : "text-fg-2 hover:bg-white/10 hover:text-fg"
                    }`}
                  >
                    <span
                      className={`grid size-6 place-items-center rounded-full font-mono text-xs tabular-nums ${
                        active ? "bg-ink text-accent" : "bg-white/10 text-fg-3"
                      }`}
                    >
                      {index + 1}
                    </span>
                    {server.name}
                  </button>
                );
              })}
            </div>

            <span className="hidden text-xs text-fg-3 lg:inline">
              Not playing? Try another server.
            </span>
          </div>
        ) : (
          <span />
        )}

        <button
          type="button"
          onClick={() => {
            setLoaded(false);
            setAttempt((n) => n + 1);
          }}
          className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm text-fg-2 transition-colors duration-200 hover:bg-white/10 hover:text-fg"
        >
          <ArrowClockwise className="size-4" aria-hidden="true" />
          Reload
        </button>
      </div>
    </div>
  );
}
