/**
 * Skeletons mirror the shape of what they replace. No generic spinners.
 *
 * Shapes follow the radius system of the real thing: text lines and buttons
 * are full round, surfaces are `rounded-card`. Spacing matches the component
 * it stands in for, so nothing jumps when the content lands.
 */

/*
 * A cached navigation resolves in well under 150ms, and a skeleton that
 * flashes for one frame reads as a flicker. Every loading surface waits 150ms
 * and then fades in; the delay survives reduced motion (it is not movement),
 * only the fade collapses.
 */
const DEFER = "animate-fade [animation-delay:150ms]";

/** Root of every `loading.tsx`: deferred, and announced once to screen readers. */
export function LoadingPage({ children }: { children: React.ReactNode }) {
  return (
    <div aria-busy="true" className={DEFER}>
      <p role="status" className="sr-only">
        Loading
      </p>
      {children}
    </div>
  );
}

/** A line of text. Full round, like every other pill-shaped thing here. */
function Line({ className }: { className: string }) {
  return <div className={`skeleton rounded-full ${className}`} />;
}

export function HeroSkeleton() {
  return (
    <div className="relative flex min-h-[520px] items-end overflow-hidden sm:min-h-[560px] md:-ml-18 md:min-h-[clamp(600px,min(88dvh,56.25vw),960px)]">
      <div className="skeleton absolute inset-0" />
      <div className="scrim-bottom absolute inset-x-0 bottom-0 h-4/5" />
      {/* Hero's own frame: re-padded past the rail, copy at the foot. */}
      <div className="w-full md:pl-18">
        <div className="page relative pt-32 pb-12 md:pb-16">
          <div className="max-w-[40rem] space-y-5">
            <Line className="h-3 w-28" />
            <div className="skeleton h-14 w-3/4 rounded-card md:h-20" />
            <Line className="h-3 w-56" />
            <div className="space-y-2">
              <Line className="h-3 w-full max-w-[56ch]" />
              <Line className="h-3 w-4/5 max-w-[46ch]" />
            </div>
            <div className="flex gap-3 pt-4">
              <div className="skeleton h-14 w-40 rounded-full" />
              <div className="skeleton h-14 w-32 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CardSkeleton() {
  return (
    <div>
      <div className="skeleton aspect-2/3 w-full rounded-card" />
      <Line className="mt-3 h-3 w-4/5" />
      <Line className="mt-2 h-2.5 w-2/5" />
    </div>
  );
}

export function GridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div
      aria-hidden="true"
      className={`grid grid-cols-2 gap-x-4 gap-y-9 sm:grid-cols-3 md:grid-cols-4 md:gap-x-5 lg:grid-cols-5 xl:grid-cols-6 min-[1700px]:grid-cols-8 ${DEFER}`}
    >
      {Array.from({ length: count }, (_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

/** The browse filter bar: provider tiles, then the pills. */
export function FilterBarSkeleton() {
  return (
    <div className="mb-10 space-y-5 md:mb-12">
      <div className="flex gap-2 overflow-hidden">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="skeleton size-11 shrink-0 rounded-card" />
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {["w-32", "w-36", "w-28", "w-28"].map((width, i) => (
          <div key={i} className={`skeleton h-10 rounded-full ${width}`} />
        ))}
      </div>
    </div>
  );
}

export function PosterRailSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="flex gap-4 overflow-hidden px-5 md:gap-5 md:px-8 xl:px-12">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="w-[148px] shrink-0 md:w-[184px]">
          <CardSkeleton />
        </div>
      ))}
    </div>
  );
}

export function TrendingRailSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="flex gap-4 overflow-hidden px-5 md:gap-5 md:px-8 xl:px-12">
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className="skeleton aspect-video w-[280px] shrink-0 rounded-card sm:w-[360px] lg:w-[420px]"
        />
      ))}
    </div>
  );
}

/** Heading only, tick included. The caller owns the page gutter. */
export function SectionHeadingSkeleton() {
  return (
    <div className="flex items-center gap-3">
      <div className="skeleton h-5 w-1 rounded-full" />
      <div className="skeleton h-7 w-52 rounded-full" />
    </div>
  );
}

/*
 * Same shape as TitleHero: one hero with the copy sitting at its foot, no
 * poster, then the fact tiles. The old version put a blank block above the
 * copy, so the whole page jumped when the real hero arrived.
 */
export function DetailsSkeleton() {
  return (
    <div>
      <div className="relative flex min-h-[560px] items-end overflow-hidden md:-ml-18 md:min-h-[clamp(600px,min(88dvh,56.25vw),960px)]">
        <div className="skeleton absolute inset-0" />
        <div className="scrim-bottom absolute inset-x-0 bottom-0 h-1/3" />
        <div className="w-full md:pl-18">
          <div className="page relative pt-32 pb-10 md:pb-14">
            <div className="max-w-[40rem] space-y-5">
              <Line className="h-3 w-24" />
              <div className="skeleton h-24 w-full max-w-[26rem] rounded-card md:h-32" />
              <Line className="h-3 w-64" />
              <div className="space-y-2">
                <Line className="h-3 w-full" />
                <Line className="h-3 w-11/12" />
                <Line className="h-3 w-3/5" />
              </div>
              <div className="flex gap-3 pt-3">
                <div className="skeleton h-14 w-44 rounded-full" />
                <div className="skeleton h-14 w-36 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="page pt-2 pb-4">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="skeleton h-16 rounded-card" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function EpisodeListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <ul className="flex gap-4 overflow-hidden md:gap-5">
      {Array.from({ length: count }, (_, i) => (
        <li key={i} className="w-[240px] shrink-0 space-y-3 md:w-[264px]">
          <div className="skeleton aspect-video w-full rounded-card" />
          <Line className="h-3.5 w-3/5" />
          <Line className="h-2.5 w-full" />
        </li>
      ))}
    </ul>
  );
}

/** Season pills are full round, like the real SeasonSelector. */
export function SeasonSelectorSkeleton() {
  return (
    <div className="flex gap-2">
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i} className="skeleton h-10 w-28 rounded-full" />
      ))}
    </div>
  );
}

export function PlayerSkeleton() {
  return <div className="skeleton aspect-video w-full rounded-card" />;
}

/**
 * A whole section, heading included. Used by streamed page sections. Padding
 * and heading gap are Section's own, so the swap does not move anything.
 */
export function SectionSkeleton({
  bleed = false,
  children,
}: {
  bleed?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section aria-hidden="true" className="py-10 md:py-14">
      <div className="page">
        <SectionHeadingSkeleton />
      </div>
      <div className={bleed ? "mt-6 md:mt-8" : "page mt-6 md:mt-8"}>
        {children}
      </div>
    </section>
  );
}
