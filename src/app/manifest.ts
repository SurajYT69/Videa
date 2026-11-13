import type { MetadataRoute } from "next";

/*
 * Makes oovi installable ("Add to home screen"). Per the Next.js PWA guide, a
 * valid manifest over HTTPS is what browsers need for that; no service worker.
 * The PNGs are written to /public by `node scripts/export-logo.mjs`.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "oovi",
    short_name: "oovi",
    description: "Search any movie or series by name and start watching.",
    start_url: "/",
    display: "standalone",
    background_color: "#0b0c0e",
    theme_color: "#0b0c0e",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
