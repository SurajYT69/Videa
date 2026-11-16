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
  weight: ["500"],
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
    default: "oovi · Search and watch movies and TV",
    template: "%s · oovi",
  },
  description:
    "Search any movie or series by name and start watching. Metadata by TMDB.",
  openGraph: {
    type: "website",
    siteName: "oovi",
    title: "oovi · Search and watch movies and TV",
    description:
      "Search any movie or series by name and start watching. Metadata by TMDB.",
  },
  twitter: {
    card: "summary_large_image",
    title: "oovi · Search and watch movies and TV",
    description:
      "Search any movie or series by name and start watching. Metadata by TMDB.",
  },
};

/* Both track `--color-ink`. A stale themeColor is a white flash on first paint. */
export const viewport: Viewport = {
  themeColor: "#0b0c0e",
  colorScheme: "dark light",
  /* Paint under the notch; the phone header pads itself back out. */
  viewportFit: "cover",
  /* Android: the keyboard shrinks the layout like it does on iOS. */
  interactiveWidget: "resizes-content",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    /* data-mode is dark on the server; the script below switches it to the
       saved choice before first paint, so a light reader never sees a dark
       flash. That is the one attribute that differs, hence the warning
       suppression on this element only. */
    <html
      lang="en"
      data-mode="dark"
      suppressHydrationWarning
      className={`${display.variable} ${sans.variable} ${mono.variable}`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(localStorage.getItem("oovi-theme")==="light"){document.documentElement.dataset.mode="light";document.querySelector('meta[name="theme-color"]')?.setAttribute("content","#f5f6f8")}}catch(e){}`,
          }}
        />
      </head>
      {/* Browser extensions (e.g. ColorZilla's cz-shortcut-listen) add attributes
          to <body> before React hydrates. This silences that one element's
          attribute mismatch only; children are still checked. */}
      <body suppressHydrationWarning>
        {/* Observed by the header to decide when to become opaque. */}
        <div data-scroll-sentinel aria-hidden="true" className="absolute top-0 h-px w-full" />

        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-card focus:bg-fg focus:px-4 focus:py-2 focus:text-sm focus:text-ink"
        >
          Skip to content
        </a>

        {/* Takes its colour from the hero artwork; see AmbientTint. */}
        <div aria-hidden="true" className="ambient pointer-events-none fixed inset-0 -z-20" />

        <Header />
        {/* Clears the icon rail from md up (heroes break back out under it),
            and the phone tab bar below md. */}
        <div className="pb-[calc(5.5rem+env(safe-area-inset-bottom))] md:pb-0 md:pl-18">
          <main id="main">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
