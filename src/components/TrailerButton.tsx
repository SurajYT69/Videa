"use client";

import { useRef } from "react";
import { FilmStrip, X } from "@phosphor-icons/react";

/**
 * Opens the title's official trailer in a modal. A native <dialog>: focus is
 * trapped, Escape closes it, and the page behind becomes inert for free.
 *
 * The iframe only exists while the dialog is open, so YouTube loads nothing
 * until the viewer asks for it.
 */
export function TrailerButton({ videoKey, title }: { videoKey: string; title: string }) {
  const ref = useRef<HTMLDialogElement>(null);
  const frame = useRef<HTMLDivElement>(null);

  const open = () => {
    const box = frame.current;
    if (box && !box.firstChild) {
      const iframe = document.createElement("iframe");
      iframe.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoKey)}?autoplay=1&rel=0`;
      iframe.title = `${title} trailer`;
      iframe.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen";
      iframe.allowFullscreen = true;
      iframe.className = "absolute inset-0 h-full w-full border-0";
      box.appendChild(iframe);
    }
    ref.current?.showModal();
  };

  /* Removing the iframe is what stops playback when the dialog closes. */
  const onClose = () => frame.current?.replaceChildren();

  return (
    <>
      <button
        type="button"
        onClick={open}
        className="glass inline-flex items-center gap-2 rounded-full px-6 py-4 text-base font-medium whitespace-nowrap text-fg transition duration-200 hover:bg-white/15 active:translate-y-px"
      >
        <FilmStrip className="size-4" aria-hidden="true" />
        Trailer
      </button>

      <dialog
        ref={ref}
        onClose={onClose}
        onClick={(event) => {
          /* A click on the backdrop lands on the dialog element itself. */
          if (event.target === ref.current) ref.current.close();
        }}
        aria-label={`${title} trailer`}
        className="m-auto w-[min(92vw,1100px)] overflow-visible bg-transparent p-0 backdrop:bg-ink/85 backdrop:backdrop-blur-sm"
      >
        <div className="relative">
          <button
            type="button"
            onClick={() => ref.current?.close()}
            className="glass-panel absolute -top-14 right-0 grid size-11 place-items-center rounded-full text-fg transition-colors hover:text-accent"
          >
            <X className="size-5" aria-hidden="true" />
            <span className="sr-only">Close trailer</span>
          </button>
          <div
            ref={frame}
            className="relative aspect-video w-full overflow-hidden rounded-card bg-ink shadow-lift"
          />
        </div>
      </dialog>
    </>
  );
}
