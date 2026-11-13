import Link from "next/link";
import { Wordmark } from "./Wordmark";

const COLUMNS = [
  {
    heading: "Browse",
    links: [
      { href: "/", label: "Home" },
      { href: "/movie", label: "Movies" },
      { href: "/tv", label: "TV" },
      { href: "/anime", label: "Anime" },
    ],
  },
  {
    heading: "Yours",
    links: [
      { href: "/search", label: "Search" },
      { href: "/my-list", label: "My List" },
    ],
  },
] as const;

/**
 * Quiet chrome, one moment. The links and credits sit in a compact row; the
 * wordmark below runs the full width and is cropped by the page's bottom edge,
 * so the lime eyes are the only colour here. The letters are one hairline step
 * above the ground: present, not competing with the eyes.
 */
export function Footer() {
  return (
    <footer className="mt-8 overflow-hidden border-t border-line">
      <div className="page grid gap-12 pt-16 md:grid-cols-[minmax(0,1fr)_auto] md:gap-20 md:pt-20">
        <div className="max-w-md">
          <p className="display text-2xl text-fg md:text-3xl">
            Find a film or series, press play
          </p>
          <p className="mt-3 text-sm leading-relaxed text-fg-3">
            No account. Your list and where you stopped stay in this browser.
          </p>
        </div>

        <div className="flex gap-16 md:gap-20">
          {COLUMNS.map((column) => (
            <nav key={column.heading} aria-label={column.heading}>
              <h2 className="eyebrow">{column.heading}</h2>
              <ul className="mt-4 space-y-3">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-fg-2 transition-colors duration-200 hover:text-fg"
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

      <div className="page mt-12 md:mt-16">
        <p className="max-w-3xl border-t border-line pt-6 text-xs leading-relaxed text-fg-3">
          This product uses the TMDB API but is not endorsed or certified by
          TMDB. Streaming availability is provided by JustWatch. Anime scores
          are from MyAnimeList; IMDb, Rotten Tomatoes and Metacritic scores via
          OMDb.
        </p>
      </div>

      {/* Cropped below the pupils: the viewBox is 144 tall from y=-44, and
          124 of it shows, so the eyes stay whole while the letters run off
          the edge. Decorative here; the page already names itself. */}
      <div aria-hidden="true" className="page mt-10 md:mt-14">
        <div className="group aspect-[350/124] overflow-hidden text-line">
          <Wordmark className="block h-auto w-full" />
        </div>
      </div>
    </footer>
  );
}
