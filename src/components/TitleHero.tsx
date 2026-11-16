import Image from "next/image";
import type { ReactNode } from "react";
import { AmbientTint } from "./AmbientTint";
import { Score } from "./Rating";
import { ShareButton } from "./ShareButton";
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
    <section className="relative isolate flex items-end overflow-hidden md:-ml-18 md:min-h-[clamp(600px,min(88dvh,56.25vw),960px)]">
      {src ? (
        <div className="absolute inset-x-0 top-0 -z-10 aspect-video md:inset-0 md:aspect-auto">
          {/* Phones show the whole 16:9 still across the top instead of
              covering a portrait box, which zoomed a wide frame until only a
              sliver of the middle was left. From md up it fills the hero. */}
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
          className="object-cover md:object-[64%_22%]"
        />
          {/* Phones only: the still ends here, so it fades into the ground. */}
          <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-ink to-transparent md:hidden" />
        </div>
      ) : (
        <div className="absolute inset-0 -z-10 bg-surface" />
      )}
      <AmbientTint />

      <div className="scrim-corner absolute inset-0 -z-10" />
      <div className="scrim-bottom absolute inset-x-0 bottom-0 -z-10 h-1/3" />

      <div className="w-full md:pl-18">
        <div className="page relative pt-[calc(56.25vw-1rem)] pb-10 md:pt-32 md:pb-14">
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

            <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2">
              <Score value={rating} />
              {shown.map((fact, index) => (
                <span key={fact} className="flex items-center gap-3">
                  {(index > 0 || hasScore) && (
                    <span aria-hidden="true" className="hidden size-1 rounded-full bg-fg-3/60 sm:block" />
                  )}
                  <span className="text-sm font-medium whitespace-nowrap text-fg-2 tabular-nums">
                    {fact}
                  </span>
                </span>
              ))}
            </div>

            {/* The tagline is the title's own voice, so it takes the display
                face; the overview below it is reference and stays text. */}
            {tagline && (
              <p className="display mt-6 max-w-[34ch] text-lg leading-snug text-balance text-fg md:text-xl">
                {tagline}
              </p>
            )}

            {overview && (
              <p
                className={`${tagline ? "mt-3" : "mt-6"} line-clamp-3 max-w-[60ch] text-[15px] leading-relaxed text-pretty text-fg-2 md:text-base`}
              >
                {overview}
              </p>
            )}

            <div className="mt-8 flex flex-wrap items-center gap-3">
              {children}
              <ShareButton title={title} />
            </div>

            {providers.length > 0 && (
              <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-3">
                <span className="eyebrow">Streaming on</span>
                <ul className="flex flex-wrap items-center gap-2">
                  {providers.map((provider) => (
                    <li key={provider.name} title={provider.name} className="relative">
                      <Image
                        src={tmdbImage(provider.logoPath, PROVIDER.sm) ?? ""}
                        alt={provider.name}
                        width={32}
                        height={32}
                        className="size-8 rounded-mini"
                      />
                      <span className="pointer-events-none absolute inset-0 rounded-mini art-edge" />
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

/**
 * Reference facts as a spec sheet: label over value, columns divided by
 * hairlines rather than boxed into tiles. A row of same-size glass boxes read
 * as a dashboard; this reads as the back of the case. Empty values are dropped.
 * Rendered inside the page's details stack, so it carries no gutter of its own.
 */
export function FactTiles({
  facts,
}: {
  facts: Array<[label: string, value: string | null | undefined]>;
}) {
  const shown = facts.filter((fact): fact is [string, string] => Boolean(fact[1]));
  if (!shown.length) return null;

  return (
    <dl className="grid grid-cols-2 gap-x-6 gap-y-6 border-t border-line pt-6 sm:grid-cols-3 lg:grid-cols-[repeat(auto-fit,minmax(9rem,1fr))]">
      {shown.map(([label, value]) => (
        <div key={label} className="min-w-0">
          <dt className="eyebrow">{label}</dt>
          <dd className="mt-2 line-clamp-3 text-sm leading-normal text-pretty text-fg" title={value}>
            {value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
