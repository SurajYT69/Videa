import Image from "next/image";
import type { ReactNode } from "react";
import { AmbientTint } from "./AmbientTint";
import { Score } from "./Rating";
import { BACKDROP, LOGO, PROVIDER, tmdbImage } from "@/lib/images";
import type { Provider } from "@/lib/types";

type Props = {
  title: string;
  /** "Film" or "Series". */
  kind: string;
  backdropPath: string | null;
  /** The title's own logo art. Falls back to the typed title when absent. */
  logoPath: string | null;
  rating: number;
  /** One line of facts; empty entries are dropped. */
  facts: Array<string | null | undefined>;
  tagline?: string | null;
  overview: string;
  /** Services that carry the title. Informational; playback is oovi's own. */
  providers?: Provider[];
  /** Sits bottom-right on wide screens, e.g. the resume card. */
  aside?: ReactNode;
  /** The actions row. */
  children: ReactNode;
};

/**
 * The opener for a title page: the backdrop is the page, and everything a
 * viewer needs to decide and press play sits on it, bottom-left.
 *
 * It breaks out under the icon rail on desktop (`md:-ml-18`) and pads its
 * content back in, so the still runs edge to edge.
 */
export function TitleHero({
  title,
  kind,
  backdropPath,
  logoPath,
  rating,
  facts,
  tagline,
  overview,
  providers = [],
  aside,
  children,
}: Props) {
  const src = tmdbImage(backdropPath, BACKDROP.xl);
  const logo = tmdbImage(logoPath, LOGO.md);
  const shown = facts.filter(Boolean) as string[];
  const hasScore = rating > 0;

  return (
    <section className="relative isolate flex min-h-[560px] items-end overflow-hidden md:-ml-18 md:min-h-[clamp(600px,min(88dvh,56.25vw),960px)]">
      {src ? (
        <Image
          src={src}
          alt=""
          fill
          priority
          fetchPriority="high"
          sizes="100vw"
          /* Heroes only: 75 bands the dark gradients of a full-screen still. */
          quality={90}
          data-ambient
          className="-z-10 object-cover object-[50%_20%] md:object-[64%_22%]"
        />
      ) : (
        <div className="absolute inset-0 -z-10 bg-surface" />
      )}
      <AmbientTint />

      <div className="scrim-corner absolute inset-0 -z-10" />
      <div className="scrim-bottom absolute inset-x-0 bottom-0 -z-10 h-1/3" />

      <div className="w-full md:pl-18">
        <div className="page relative pt-32 pb-10 md:pb-14">
          <div className="max-w-[40rem]">
            <p className="eyebrow">{kind}</p>

            <h1 className="mt-4">
              {logo ? (
                <>
                  <span className="sr-only">{title}</span>
                  <span className="relative block h-24 w-full max-w-[26rem] md:h-32">
                    <Image
                      src={logo}
                      alt=""
                      fill
                      sizes="(min-width: 768px) 416px, 80vw"
                      className="object-contain object-left-bottom"
                    />
                  </span>
                </>
              ) : (
                <span className="display display-page block max-w-[18ch] text-fg text-balance">
                  {title}
                </span>
              )}
            </h1>

            <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2">
              <Score value={rating} />
              {shown.map((fact, index) => (
                <span key={fact} className="flex items-center gap-4">
                  {(index > 0 || hasScore) && (
                    <span aria-hidden="true" className="h-3 w-px bg-fg-3/40" />
                  )}
                  <span className="text-sm font-medium text-fg-2">{fact}</span>
                </span>
              ))}
            </div>

            {tagline && <p className="mt-5 text-base text-fg-3">{tagline}</p>}

            {overview && (
              <p className="mt-4 line-clamp-3 max-w-[60ch] text-[15px] leading-relaxed text-fg-2 md:text-base">
                {overview}
              </p>
            )}

            <div className="mt-8 flex flex-wrap items-center gap-3">
              {children}
            </div>

            {providers.length > 0 && (
              <div className="mt-6 flex items-center gap-3">
                <span className="eyebrow">Streaming on</span>
                <ul className="flex items-center gap-2">
                  {providers.map((provider) => (
                    <li key={provider.name} title={provider.name}>
                      <Image
                        src={tmdbImage(provider.logoPath, PROVIDER.sm) ?? ""}
                        alt={provider.name}
                        width={28}
                        height={28}
                        className="size-7 rounded-mini"
                      />
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {aside && (
            <div className="absolute right-5 bottom-10 hidden w-[26rem] lg:block xl:right-12 md:bottom-14">
              {aside}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/** Reference facts as a row of small glass tiles. Empty values are dropped. */
export function FactTiles({
  facts,
}: {
  facts: Array<[label: string, value: string | null | undefined]>;
}) {
  const shown = facts.filter((fact): fact is [string, string] => Boolean(fact[1]));
  if (!shown.length) return null;

  return (
    <div className="page pt-2 pb-4">
      <dl className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {shown.map(([label, value]) => (
          <div key={label} className="glass rounded-card px-4 py-3">
            <dt className="eyebrow">{label}</dt>
            <dd className="mt-2 line-clamp-2 text-sm text-fg">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
