import Image from "next/image";
import Link from "next/link";
import { PROFILE, tmdbImage } from "@/lib/images";
import type { CastMember } from "@/lib/types";

export function CastRail({ cast }: { cast: CastMember[] }) {
  return (
    <div className="rail rail-gutter gap-5 pb-2">
      {cast.map((person) => {
        const src = tmdbImage(person.profilePath, PROFILE.md);
        return (
          <Link
            key={person.id}
            href={`/person/${person.id}`}
            className="rail-item group block w-[112px] rounded-card md:w-[128px]"
          >
          <figure>
            <div className="relative aspect-2/3 overflow-hidden rounded-card bg-surface">
              {src ? (
                <Image
                  src={src}
                  alt={person.name}
                  fill
                  /* Measured: 112px phone, 128px md up. */
                  sizes="(min-width: 768px) 128px, 112px"
                  className="object-cover"
                />
              ) : (
                <div className="absolute inset-0 grid place-items-center">
                  <span className="font-mono text-lg text-fg-3">
                    {person.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div className="pointer-events-none absolute inset-0 rounded-card art-edge" />
            </div>
            <figcaption className="mt-3">
              <span className="block line-clamp-1 text-xs text-fg transition-colors duration-200 group-hover:text-accent">
                {person.name}
              </span>
              {person.character && (
                <span className="mt-1 block line-clamp-1 text-xs text-fg-3">
                  {person.character}
                </span>
              )}
            </figcaption>
          </figure>
          </Link>
        );
      })}
    </div>
  );
}
