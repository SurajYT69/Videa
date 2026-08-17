import Link from "next/link";
import { Wordmark } from "./Wordmark";

const COLUMNS = [
  {
    heading: "Browse",
    links: [
      { href: "/", label: "Home" },
      { href: "/movie", label: "Movies" },
      { href: "/tv", label: "TV" },
      { href: "/search", label: "Search" },
    ],
  },
  {
    heading: "Yours",
    links: [{ href: "/my-list", label: "My List" }],
  },
] as const;

/** Quiet by design. The footer is a destination of last resort. */
export function Footer() {
  return (
    <footer className="mt-8 border-t border-line">
      <div className="page grid gap-10 py-14 md:grid-cols-[minmax(0,1fr)_auto] md:gap-20 md:py-16">
        <div className="max-w-sm">
          <Wordmark className="h-7 w-auto" />
          <p className="mt-4 text-sm leading-relaxed text-fg-3">
            Search anything, press play. Metadata is provided by TMDB; playback
            is embedded from VidFast. Everything personal stays in this browser.
          </p>
        </div>

        <div className="flex gap-14 md:gap-20">
          {COLUMNS.map((column) => (
            <nav key={column.heading} aria-label={column.heading}>
              <h2 className="eyebrow">{column.heading}</h2>
              <ul className="mt-4 space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-fg-3 transition-colors hover:text-fg"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
      </div>

      <div className="page border-t border-line py-6">
        <p className="meta">
          This product uses the TMDB API but is not endorsed or certified by
          TMDB.
        </p>
      </div>
    </footer>
  );
}
