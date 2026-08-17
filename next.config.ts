import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "image.tmdb.org", pathname: "/t/p/**" },
    ],

    /*
     * WebP only.
     *
     * Measured on this app's own image sets: 24 fresh images at six-way
     * concurrency took ~2829ms as AVIF and ~1714ms as WebP, with the format
     * assignment swapped across pages to control for content. AVIF encoding is
     * the throughput ceiling of the single `next start` process, and with 46
     * unique optimized images on the homepage the queue is what makes a card
     * click feel slow.
     *
     * Every TMDB poster is unique, so the optimizer cache hit rate is low and
     * encode cost dominates the ~25% byte saving AVIF would give back.
     */
    formats: ["image/webp"],

    /*
     * Never ask the optimizer for a width the source cannot supply.
     *
     * The widest TMDB source this app requests is `w1280` (BACKDROP.lg), so the
     * default ladder's 1920 / 2048 / 3840 steps produced byte-identical output
     * to 1280 while still costing a resize job. A 1430px hero on a 1440px
     * screen now lands on 1280 instead of 1920.
     */
    deviceSizes: [640, 750, 828, 1080, 1280],

    /*
     * Extra steps at 192 / 320 / 448 so the fixed-width card surfaces land near
     * their rendered size instead of rounding up to the next default. The rail
     * poster (184px) takes 192 rather than 256; the trending still (420px)
     * takes 448 rather than 640.
     */
    imageSizes: [16, 32, 48, 64, 96, 128, 192, 256, 320, 384, 448],
  },
  experimental: {
    optimizePackageImports: ["@phosphor-icons/react"],
  },
};

export default nextConfig;
