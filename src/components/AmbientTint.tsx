"use client";

import { useEffect } from "react";

/**
 * Tints the page with the average colour of the hero artwork.
 *
 * Rendered beside the image it samples (`img[data-ambient]`), so the image is
 * already in the DOM when this mounts. The optimizer serves the image from
 * this origin, which is what makes the canvas readable. Any failure leaves the
 * page on its plain ground; the tint is never load-bearing.
 */
export function AmbientTint() {
  useEffect(() => {
    const root = document.documentElement;
    const img = document.querySelector<HTMLImageElement>("img[data-ambient]");
    if (!img) return;

    const sample = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = canvas.height = 8;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.drawImage(img, 0, 0, 8, 8);
        const { data } = ctx.getImageData(0, 0, 8, 8);
        let r = 0;
        let g = 0;
        let b = 0;
        for (let i = 0; i < data.length; i += 4) {
          r += data[i] ?? 0;
          g += data[i + 1] ?? 0;
          b += data[i + 2] ?? 0;
        }
        const n = data.length / 4;
        root.style.setProperty(
          "--ambient",
          `rgb(${Math.round(r / n)} ${Math.round(g / n)} ${Math.round(b / n)})`,
        );
      } catch {
        /* Tainted canvas or decode failure: stay on the plain ground. */
      }
    };

    if (img.complete && img.naturalWidth) sample();
    else img.addEventListener("load", sample, { once: true });

    return () => {
      img.removeEventListener("load", sample);
      root.style.removeProperty("--ambient");
    };
  }, []);

  return null;
}
