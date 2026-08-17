/**
 * Rasterises the logo into every size the app and the stores need.
 *
 *   node scripts/export-logo.mjs
 *
 * Source of truth is logos/iterations/iteration-5.svg (lockup) and
 * logos/iterations/mark-ramp.svg (square mark). Uses sharp, which is already
 * a Next.js dependency, so there is nothing extra to install.
 */

import sharp from "sharp";
import { mkdirSync, copyFileSync, readFileSync } from "node:fs";

const LOCKUP_SRC = "logos/iterations/iteration-5.svg";
const MARK_SRC = "logos/iterations/mark-ramp.svg";

/** Page ground. iOS composites app icons onto black, so they need this. */
const GROUND = { r: 245, g: 246, b: 248, alpha: 1 };

/** Render at high density first so curves resample cleanly at small sizes. */
const DENSITY = 600;

mkdirSync("logos/export", { recursive: true });
copyFileSync(LOCKUP_SRC, "logos/export/logo.svg");
copyFileSync(MARK_SRC, "logos/export/mark.svg");

const lockup = readFileSync("logos/export/logo.svg");
const mark = readFileSync("logos/export/mark.svg");

const written = [];

async function emit(file, buf, w, h, flatten = false) {
  let pipe = sharp(buf, { density: DENSITY }).resize(w, h);
  if (flatten) pipe = pipe.flatten({ background: GROUND });
  await pipe.png({ compressionLevel: 9 }).toFile(file);
  written.push(file);
}

// The lockup stays 2:1. Squaring a wide lockup only letterboxes it.
for (const w of [1024, 2048]) {
  await emit(`logos/export/logo-${w}x${w / 2}.png`, lockup, w, w / 2);
}

// Square mark, transparent, for favicons and anywhere the page supplies a ground.
for (const n of [16, 32, 48, 512, 1024]) {
  await emit(`logos/export/mark-${n}.png`, mark, n, n);
}

// Opaque variants for app icons and PWA manifests.
await emit("src/app/apple-icon.png", mark, 180, 180, true);
await emit("logos/export/mark-192-solid.png", mark, 192, 192, true);
await emit("logos/export/mark-512-solid.png", mark, 512, 512, true);

for (const file of written) {
  const meta = await sharp(file).metadata();
  const stats = await sharp(file).stats();
  // A non-uniform mean confirms the SVG actually rendered rather than
  // producing a blank canvas, which is the usual silent failure here.
  const mean = stats.channels[0].mean.toFixed(1);
  console.log(`${file.padEnd(40)} ${meta.width}x${meta.height}  mean=${mean}`);
}
