"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { UsersThree, Check } from "@phosphor-icons/react";
import { readPartyEvent, sendPartyCommand } from "@/lib/playback";

type State = { playing: boolean; time: number; at: number; v: number; by: string };

const POLL_MS = 2000;
/* Ahead or behind by more than this and we seek to match. */
const DRIFT_S = 2;
/* After applying the room's state, the player echoes play/pause/seek events;
   ignore our own player for this long so they are not sent back as news. */
const ECHO_MS = 1500;

/**
 * Keeps this player in step with a room. Every play, pause and seek here is
 * written to the room; every change someone else writes is applied here.
 * Polling, not sockets: a room is two to a few people and a 2s poll is about
 * 30 Redis reads a minute per viewer, well inside the free tier.
 */
export function WatchParty({
  roomId,
  frameRef,
}: {
  roomId: string;
  frameRef: RefObject<HTMLIFrameElement | null>;
}) {
  const me = useRef(Math.random().toString(36).slice(2, 12));
  const lastV = useRef(0);
  const position = useRef(0);
  const quietUntil = useRef(0);
  const skew = useRef(0);
  const [status, setStatus] = useState<"live" | "ended" | "error">("live");
  const [copied, setCopied] = useState(false);

  /* Room -> this player. */
  useEffect(() => {
    let stop = false;
    const apply = (state: State) => {
      if (state.v <= lastV.current) return;
      lastV.current = state.v;
      if (state.by === me.current) return;
      const now = Date.now() + skew.current;
      const target = state.time + (state.playing ? (now - state.at) / 1000 : 0);
      quietUntil.current = Date.now() + ECHO_MS;
      if (Math.abs(position.current - target) > DRIFT_S) {
        sendPartyCommand(frameRef.current, "seek", [Math.max(0, target)]);
      }
      sendPartyCommand(frameRef.current, state.playing ? "play" : "pause");
    };
    const poll = async () => {
      while (!stop) {
        try {
          const res = await fetch(`/api/party/${roomId}`, { cache: "no-store" });
          if (res.status === 404) {
            setStatus("ended");
            return;
          }
          if (res.ok) {
            const data = (await res.json()) as { state: State; now: number };
            skew.current = data.now - Date.now();
            apply(data.state);
            setStatus("live");
          } else setStatus("error");
        } catch {
          setStatus("error");
        }
        await new Promise((r) => setTimeout(r, POLL_MS));
      }
    };
    poll();
    return () => {
      stop = true;
    };
  }, [roomId, frameRef]);

  /* This player -> room. */
  useEffect(() => {
    const send = (playing: boolean, time: number) => {
      fetch(`/api/party/${roomId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playing, time, by: me.current }),
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((data: { state: State } | null) => {
          if (data) lastV.current = Math.max(lastV.current, data.state.v);
        })
        .catch(() => setStatus("error"));
    };
    let playing = false;
    const onMessage = (event: MessageEvent) => {
      const e = readPartyEvent(event);
      if (!e) return;
      if (e.time !== null) position.current = e.time;
      if (e.kind === "time") return;
      if (e.kind === "play") playing = true;
      if (e.kind === "pause") playing = false;
      if (Date.now() < quietUntil.current) return;
      send(playing, position.current);
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [roomId]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* Clipboard blocked: the address bar still has the link. */
    }
  };

  return (
    /* Sits inside the player's glass bar, in place of the server picker. */
    <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-3 gap-y-2 text-sm">
      <UsersThree className="size-4 text-accent" aria-hidden="true" />
      <span className="text-fg">Watch party</span>
      <span className="meta" aria-live="polite">
        {status === "live"
          ? "In sync on server 4"
          : status === "ended"
            ? "This party has ended"
            : "Reconnecting"}
      </span>
      <button
        type="button"
        onClick={copy}
        className="ml-auto inline-flex h-9 items-center gap-2 rounded-full bg-fg px-4 text-ink transition-[scale] duration-150 active:scale-[0.96]"
      >
        {copied && <Check className="size-4" aria-hidden="true" />}
        <span aria-live="polite">{copied ? "Link copied" : "Copy invite link"}</span>
      </button>
    </div>
  );
}
