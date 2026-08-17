"use client";

import { useEffect, useRef } from "react";
import { recordPlayback } from "@/lib/storage";
import { PLAYER_ORIGINS } from "@/lib/playback";
import type { MediaStub } from "@/lib/types";

const WRITE_INTERVAL_MS = 15_000;

type Props = {
  stub: MediaStub;
  season?: number;
  episode?: number;
};

type Position = { currentTime: number; duration: number };

/**
 * Reads real playback position from the provider's postMessage events.
 *
 * The embed is cross-origin, so a position is only ever stored when the player
 * actually reports one. When it does not, the entry is still saved to Continue
 * Watching without a progress bar rather than showing an invented percentage.
 */
export function PlaybackRecorder({ stub, season, episode }: Props) {
  const lastWrite = useRef(0);

  useEffect(() => {
    recordPlayback(stub, { season, episode });
    lastWrite.current = Date.now();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stub.type, stub.tmdbId, season, episode]);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (!PLAYER_ORIGINS.includes(event.origin)) return;

      const position = readPosition(event.data);
      if (!position) return;

      const now = Date.now();
      if (now - lastWrite.current < WRITE_INTERVAL_MS) return;
      lastWrite.current = now;

      const progress = Math.min(
        1,
        Math.max(0, position.currentTime / position.duration),
      );
      recordPlayback(stub, { season, episode, progress });
    };

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stub.type, stub.tmdbId, season, episode]);

  return null;
}

/** Accepts either a flat payload or one nested under `data`. */
function readPosition(data: unknown): Position | null {
  if (!data || typeof data !== "object") return null;

  const root = data as Record<string, unknown>;
  const nested =
    root.data && typeof root.data === "object"
      ? (root.data as Record<string, unknown>)
      : root;

  const currentTime = Number(nested.currentTime ?? nested.time);
  const duration = Number(nested.duration ?? nested.total);

  if (!Number.isFinite(currentTime) || !Number.isFinite(duration)) return null;
  if (duration <= 0 || currentTime < 0) return null;

  return { currentTime, duration };
}
