import type { Metadata, Viewport } from "next";
import {
  Bricolage_Grotesque,
  Instrument_Sans,
  JetBrains_Mono,
} from "next/font/google";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import "./globals.css";

/* Display: carries the brand voice at large sizes. */
const display = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

/* Text: everything the viewer actually reads. */
const sans = Instrument_Sans({
  variable: "--font-instrument",
  subsets: ["latin"],
  display: "swap",
});

/* Data: years, runtimes, episode codes, ratings. */
const mono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Videa · Search and watch movies and TV",
    template: "%s · Videa",
  },
  description:
    "Search any movie or series by name and start watching. Metadata by TMDB.",
  openGraph: {
    type: "website",
    siteName: "Videa",
    title: "Videa · Search and watch movies and TV",
    description:
      "Search any movie or series by name and start watching. Metadata by TMDB.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Videa · Search and watch movies and TV",
    description:
      "Search any movie or series by name and start watching. Metadata by TMDB.",
  },
};

/* Both track `--color-ink`. A stale themeColor is a white flash on first paint. */
export const viewport: Viewport = {
  themeColor: "#0f1116",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${sans.variable} ${mono.variable}`}
    >
      <body>
        {/*
          The brand ramp, defined once. <Wordmark> renders three times per page
          and duplicating a gradient id would be invalid markup. Coordinates are
          userSpaceOnUse and resolve against the referencing SVG's viewBox.

          These five stops must byte-match --color-g1..g5 in globals.css. SVG
          gradients cannot read Tailwind theme tokens, so the ramp is duplicated
          here and the two copies have to move in the same commit or the logo
          drifts out of the palette it is supposed to define.
        */}
        <svg
          width="0"
          height="0"
          aria-hidden="true"
          focusable="false"
          style={{ position: "absolute" }}
        >
          <defs>
            <linearGradient
              id="videa-ramp"
              gradientUnits="userSpaceOnUse"
              x1="152"
              y1="168"
              x2="152"
              y2="344"
            >
              <stop offset="0" stopColor="#FFC03D" />
              <stop offset="0.25" stopColor="#FF8A52" />
              <stop offset="0.5" stopColor="#FF4E96" />
              <stop offset="0.75" stopColor="#BE58E3" />
              <stop offset="1" stopColor="#7B6EF6" />
            </linearGradient>
          </defs>
        </svg>

        {/* Observed by the header to decide when to become opaque. */}
        <div data-scroll-sentinel aria-hidden="true" className="absolute top-0 h-px w-full" />

        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-card focus:bg-fg focus:px-4 focus:py-2 focus:text-sm focus:text-ink"
        >
          Skip to content
        </a>

        <Header />
        <main id="main">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
