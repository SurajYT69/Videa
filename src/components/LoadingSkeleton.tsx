/**
 * Skeletons mirror the shape of what they replace. No generic spinners.
 */

export function HeroSkeleton() {
  return (
    <div className="relative flex min-h-[520px] items-end overflow-hidden sm:min-h-[560px] md:-ml-18 md:min-h-[clamp(600px,min(88dvh,56.25vw),960px)]">
      <div className="skeleton absolute inset-0" />
      <div className="scrim-bottom absolute inset-x-0 bottom-0 h-4/5" />
      <div className="page relative w-full pt-32 pb-16 md:pb-24">
        <div className="max-w-[46rem] space-y-5">
          <div className="skeleton h-3 w-28 rounded-sm" />
          <div className="skeleton h-14 w-3/4 rounded-card md:h-20" />
          <div className="skeleton h-3 w-56 rounded-sm" />
          <div className="space-y-2">
            <div className="skeleton h-3 w-full max-w-[56ch] rounded-sm" />
            <div className="skeleton h-3 w-4/5 max-w-[46ch] rounded-sm" />
          </div>
          <div className="flex gap-3 pt-4">
            <div className="skeleton h-14 w-40 rounded-card" />
            <div className="skeleton h-14 w-32 rounded-card" />
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
      <div className="skeleton mt-3 h-3 w-4/5 rounded-sm" />
      <div className="skeleton mt-2 h-2.5 w-2/5 rounded-sm" />
    </div>
  );
}

export function GridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-9 sm:grid-cols-3 md:grid-cols-4 md:gap-x-5 lg:grid-cols-5 xl:grid-cols-6">
      {Array.from({ length: count }, (_, i) => (
        <CardSkeleton key={i} />
      ))}
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

/** Heading only. The caller owns the page gutter. */
export function SectionHeadingSkeleton() {
  return (
    <div className="skeleton h-7 w-52 rounded-mini" />
  );
}

export function DetailsSkeleton() {
  return (
    <div>
      <div className="skeleton min-h-[560px] md:-ml-18 md:min-h-[clamp(600px,min(88dvh,56.25vw),960px)]" />
      <div className="page pt-6 pb-12">
        <div className="max-w-[40rem] space-y-5">
          <div className="skeleton h-3 w-24 rounded-sm" />
          <div className="skeleton h-12 w-2/3 rounded-card md:h-16" />
          <div className="skeleton h-3 w-64 rounded-sm" />
          <div className="space-y-2">
            <div className="skeleton h-3 w-full rounded-sm" />
            <div className="skeleton h-3 w-11/12 rounded-sm" />
            <div className="skeleton h-3 w-3/5 rounded-sm" />
          </div>
          <div className="skeleton h-14 w-48 rounded-card" />
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
          <div className="skeleton h-3.5 w-3/5 rounded-sm" />
          <div className="skeleton h-2.5 w-full rounded-sm" />
        </li>
      ))}
    </ul>
  );
}

export function SeasonSelectorSkeleton() {
  return (
    <div className="flex gap-2">
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i} className="skeleton h-11 w-28 rounded-card" />
      ))}
    </div>
  );
}

export function PlayerSkeleton() {
  return <div className="skeleton aspect-video w-full rounded-card" />;
}


/** A whole section, heading included. Used by streamed page sections. */
export function SectionSkeleton({
  bleed = false,
  children,
}: {
  bleed?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className="py-14 md:py-20">
      <div className="page">
        <div className="h-px w-full bg-line" />
        <div className="mt-6 md:mt-8">
          <SectionHeadingSkeleton />
        </div>
      </div>
      <div className={bleed ? "mt-8 md:mt-10" : "page mt-8 md:mt-10"}>
        {children}
      </div>
    </section>
  );
}
