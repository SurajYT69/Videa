import { ImageResponse } from "next/og";
import { BACKDROP, LOGO, tmdbImage } from "./images";
import { metaLine, ratingLabel, year } from "./format";
import type { MovieDetails, TVDetails } from "./types";

/*
 * The Open Graph card for a title page, 1200x630: backdrop full-bleed under a
 * scrim, the title's logo art (or its name), one facts line, and the eyes.
 * ImageResponse cannot read CSS tokens, so the hex values below are the
 * palette's own (`--color-ink`, `--color-mark`, `--color-fg`, `--color-fg-2`).
 */

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const INK = "#0B0C0E";
const MARK = "#C8F031";
const FG = "#F4F5F0";
const FG_2 = "#BABCBA";

/** Network bytes as a data URI, or null. A flaky fetch never fails the card. */
async function dataUri(url: string | null): Promise<string | null> {
  if (!url) return null;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return null;
    const type = res.headers.get("content-type") ?? "image/png";
    return `data:${type};base64,${Buffer.from(await res.arrayBuffer()).toString("base64")}`;
  } catch {
    return null;
  }
}

/** A Google Fonts subset for exactly `text`, as TTF (what Satori reads). */
async function googleFont(family: string, weight: number, text: string) {
  try {
    const css = await fetch(
      `https://fonts.googleapis.com/css2?family=${family.replace(/ /g, "+")}:wght@${weight}&text=${encodeURIComponent(text)}`,
      { signal: AbortSignal.timeout(3000) },
    ).then((res) => res.text());
    const src = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype)'\)/)?.[1];
    if (!src) return null;
    const data = await fetch(src, { signal: AbortSignal.timeout(3000) }).then((res) =>
      res.arrayBuffer(),
    );
    return { name: family, data, weight: weight as 500, style: "normal" as const };
  } catch {
    return null;
  }
}

export async function shareCard(
  details: MovieDetails | TVDetails | null,
  kind: "Film" | "Series",
) {
  const title = details?.title ?? "oovi";
  const rating = details ? ratingLabel(details.rating) : null;
  const line = metaLine(
    details ? year(details.releaseDate) : null,
    kind,
    rating ? `${rating} / 10` : null,
  );

  const [backdrop, logo, display, mono] = await Promise.all([
    dataUri(tmdbImage(details?.backdropPath, BACKDROP.lg)),
    dataUri(tmdbImage(details?.logoPath, LOGO.md)),
    googleFont("Bricolage Grotesque", 500, title),
    googleFont("JetBrains Mono", 500, line),
  ]);

  return new ImageResponse(
    (
      <div style={{ display: "flex", width: "100%", height: "100%", background: INK, position: "relative" }}>
        {backdrop && (
          // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
          <img
            src={backdrop}
            width={1200}
            height={630}
            style={{ position: "absolute", top: 0, left: 0, objectFit: "cover", objectPosition: "60% 25%" }}
          />
        )}
        {/* One scrim, weighted bottom-left where the type is. */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: 1200,
            height: 630,
            backgroundImage:
              "linear-gradient(to top, rgba(10,12,16,0.92) 0%, rgba(10,12,16,0.55) 45%, rgba(10,12,16,0.1) 100%)",
          }}
        />

        <div
          style={{
            position: "absolute",
            left: 72,
            right: 72,
            bottom: 64,
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
          }}
        >
          {logo ? (
            // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
            <img src={logo} style={{ maxWidth: 620, maxHeight: 190, objectFit: "contain", objectPosition: "left bottom" }} />
          ) : (
            <div
              style={{
                fontFamily: display ? "Bricolage Grotesque" : undefined,
                fontSize: title.length > 28 ? 64 : 84,
                lineHeight: 1.02,
                letterSpacing: "-0.02em",
                color: FG,
                maxWidth: 900,
              }}
            >
              {title}
            </div>
          )}
          <div
            style={{
              marginTop: 28,
              fontFamily: mono ? "JetBrains Mono" : undefined,
              fontSize: 28,
              color: FG_2,
            }}
          >
            {line}
          </div>
        </div>

        {/* The oovi wordmark, from logos/oovi/logo.svg. */}
        <svg
          viewBox="0 -44 350 144"
          width={175}
          height={72}
          style={{ position: "absolute", top: 56, right: 64 }}
        >
          <circle cx="50" cy="50" r="50" fill={MARK} />
          <circle cx="66" cy="50" r="21" fill={INK} />
          <circle cx="158" cy="50" r="50" fill={MARK} />
          <circle cx="174" cy="50" r="21" fill={INK} />
          <circle cx="337" cy="-28" r="16" fill={MARK} />
          <path d="M216 0 H245 L265 64 L285 0 H314 L279 100 H251 Z" fill={FG} />
          <path d="M324 0 H350 V100 H324 Z" fill={FG} />
        </svg>
      </div>
    ),
    { ...size, fonts: [display, mono].filter((font) => font !== null) },
  );
}
