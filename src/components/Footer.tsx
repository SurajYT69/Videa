import Link from "next/link";
import { Wordmark } from "./Wordmark";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/movie", label: "Movies" },
  { href: "/tv", label: "TV" },
  { href: "/my-list", label: "My List" },
];

export function Footer() {
  return (
    <footer className="mt-16 border-t border-line">
      <div className="page flex flex-col gap-8 py-12 md:flex-row md:items-start md:justify-between">
        <div>
          <Wordmark className="h-8 w-auto" />
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-fg-3">
            Search anything. Metadata is provided by TMDB; playback is embedded
            from VidFast.
          </p>
        </div>

        <nav aria-label="Footer">
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {LINKS.map((link) => (
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
