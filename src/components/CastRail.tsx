import Image from "next/image";
import Link from "next/link";
import { PROFILE, tmdbImage } from "@/lib/images";
import type { CastMember } from "@/lib/types";

export function CastRail({ cast }: { cast: CastMember[] }) {
  return (
    <div className="rail rail-gutter gap-4 pb-2 md:gap-5">
      {cast.map((person) => {
        const src = tmdbImage(person.profilePath, PROFILE.md);
        return (
          <Link
            key={person.id}
            href={`/person/${person.id}`}
            className="rail-item group block w-[112px] rounded-card md:w-[128px]"
          >
          <figure>
            <div className="relative aspect-2/3 overflow-hidden rounded-card bg-surface transition-shadow duration-300 group-hover:shadow-lift">
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
            {/* Name leads, the role sits under it a step quieter. Hover is
                the shadow, as on every other card; the accent is not a hover. */}
            <figcaption className="mt-3" title={person.character ? `${person.name} as ${person.character}` : person.name}>
              <span className="block line-clamp-1 text-sm font-medium text-fg">
                {person.name}
              </span>
              {person.character && (
                <span className="mt-0.5 block line-clamp-1 text-xs text-fg-3">
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
