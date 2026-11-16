"use client";

import { useEffect, useRef } from "react";

/*
 * The logo's eyes, alive. Every rendered logo registers here, and the module
 * keeps one set of window listeners for all of them: a rAF-throttled
 * pointermove that turns each pupil toward the pointer (transform only,
 * clamped inside the eye), a pointerleave on <html> that sends them home, and
 * `oovi:blink`, the only thing that makes them blink. No idle loop: nothing
 * runs unless the pointer moves or something asks for a blink.
 *
 * Tracking needs a fine pointer and no reduced-motion preference. Blinking
 * needs only the latter.
 */

/** Fire to make every logo on the page blink once. */
export const BLINK_EVENT = "oovi:blink";
export function blink() {
  window.dispatchEvent(new Event(BLINK_EVENT));
}

const R = 50; // eye radius, SVG units
const REST = 16; // the pupil rests this far right of centre
const TRAVEL = 26; // eye radius less pupil radius (21), less a 3-unit rim

type Eye = { group: SVGGElement; ball: SVGCircleElement; pupil: SVGCircleElement };
const eyes = new Set<Eye>();
let pointer: { x: number; y: number } | null = null;
let frame = 0;
let tracking = false;

function render() {
  frame = 0;
  const list = [...eyes];
  // Read every box before writing any transform, so there is one layout.
  const boxes = list.map((eye) => eye.ball.getBoundingClientRect());
  list.forEach((eye, i) => {
    const box = boxes[i]!;
    if (!pointer || !box.width) {
      eye.pupil.style.transform = "";
      return;
    }
    const dx = pointer.x - (box.left + box.width / 2);
    const dy = pointer.y - (box.top + box.height / 2);
    const distance = Math.hypot(dx, dy) || 1;
    // Saturates smoothly: full travel a few eye-widths away, little up close.
    const reach = (TRAVEL * distance) / (distance + box.width * 1.5);
    const x = (dx / distance) * reach - REST;
    const y = (dy / distance) * reach;
    eye.pupil.style.transform = `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px)`;
  });
}

function schedule() {
  if (!frame) frame = requestAnimationFrame(render);
}

function onMove(event: PointerEvent) {
  if (event.pointerType !== "mouse" && event.pointerType !== "pen") return;
  pointer = { x: event.clientX, y: event.clientY };
  schedule();
}

function onLeave() {
  pointer = null;
  schedule();
}

function onBlink() {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  for (const eye of eyes) {
    eye.group.animate(
      [{ transform: "scaleY(1)" }, { transform: "scaleY(0.1)", offset: 0.45 }, { transform: "scaleY(1)" }],
      { duration: 280, easing: "ease" },
    );
  }
}

function attach() {
  window.addEventListener(BLINK_EVENT, onBlink);
  tracking = matchMedia("(pointer: fine) and (prefers-reduced-motion: no-preference)").matches;
  if (!tracking) return;
  window.addEventListener("pointermove", onMove, { passive: true });
  document.documentElement.addEventListener("pointerleave", onLeave);
}

function detach() {
  window.removeEventListener(BLINK_EVENT, onBlink);
  if (!tracking) return;
  window.removeEventListener("pointermove", onMove);
  document.documentElement.removeEventListener("pointerleave", onLeave);
  cancelAnimationFrame(frame);
  frame = 0;
}

/** Both eyes. Must sit inside an <svg> whose user units match the artwork. */
export function LogoEyes() {
  const ref = useRef<SVGGElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const registered: Eye[] = [...root.querySelectorAll<SVGGElement>(".eye")].map((group) => ({
      group,
      ball: group.querySelector<SVGCircleElement>(".eye-ball")!,
      pupil: group.querySelector<SVGCircleElement>(".eye-pupil")!,
    }));
    if (!eyes.size) attach();
    registered.forEach((eye) => eyes.add(eye));
    if (pointer) schedule();

    // Pressing the logo is the one other thing that makes it blink.
    const svg = root.ownerSVGElement;
    svg?.addEventListener("pointerdown", blink);

    return () => {
      svg?.removeEventListener("pointerdown", blink);
      registered.forEach((eye) => eyes.delete(eye));
      if (!eyes.size) detach();
    };
  }, []);

  return (
    <g ref={ref}>
      {[50, 158].map((cx) => (
        <g key={cx} className="eye">
          <circle className="eye-ball" cx={cx} cy="50" r={R} fill="var(--color-mark)" />
          <circle className="eye-pupil" cx={cx + REST} cy="50" r="21" fill="var(--color-mark-ink)" />
        </g>
      ))}
    </g>
  );
}
