/**
 * Skeletons mirror the shape of what they replace. No generic spinners.
 */

export function HeroSkeleton() {
  return (
    <div className="relative flex min-h-[600px] items-end overflow-hidden md:min-h-[clamp(620px,74dvh,820px)]">
      <div className="skeleton absolute inset-0" />
      <div className="scrim-bottom absolute inset-x-0 bottom-0 h-4/5" />
      <div className="page relative w-full pt-32 pb-16 md:pb-24">
        <div className="max-w-[46rem] space-y-5">
          <div className="skeleton h-3 w-28 rounded-[3px]" />
          <div className="skeleton h-14 w-3/4 rounded-card md:h-20" />
          <div className="skeleton h-3 w-56 rounded-[3px]" />
          <div className="space-y-2">
            <div className="skeleton h-3 w-full max-w-[56ch] rounded-[3px]" />
            <div className="skeleton h-3 w-4/5 max-w-[46ch] rounded-[3px]" />
          </div>
          <div className="flex gap-3 pt-4">
            <div className="skeleton h-[54px] w-40 rounded-card" />
            <div className="skeleton h-[54px] w-32 rounded-card" />
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
      <div className="skeleton mt-3.5 h-3 w-4/5 rounded-[3px]" />
      <div className="skeleton mt-2 h-2.5 w-2/5 rounded-[3px]" />
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
    <div className="space-y-3">
      <div className="skeleton h-2.5 w-20 rounded-[3px]" />
      <div className="skeleton h-7 w-52 rounded-mini" />
    </div>
  );
}

export function DetailsSkeleton() {
  return (
    <div>
      <div className="skeleton relative h-[46vh] min-h-[320px] w-full md:h-[62vh]" />
      <div className="page -mt-28 grid grid-cols-1 gap-8 pb-12 md:-mt-40 md:grid-cols-12 md:gap-12">
        <div className="hidden md:col-span-4 md:block lg:col-span-3">
          <div className="skeleton aspect-2/3 w-full rounded-card" />
        </div>
        <div className="space-y-5 md:col-span-8 md:pt-20">
          <div className="skeleton h-3 w-24 rounded-[3px]" />
          <div className="skeleton h-12 w-2/3 rounded-card md:h-16" />
          <div className="skeleton h-3 w-64 rounded-[3px]" />
          <div className="space-y-2">
            <div className="skeleton h-3 w-full rounded-[3px]" />
            <div className="skeleton h-3 w-11/12 rounded-[3px]" />
            <div className="skeleton h-3 w-3/5 rounded-[3px]" />
          </div>
          <div className="skeleton h-[58px] w-48 rounded-card" />
        </div>
      </div>
    </div>
  );
}

export function EpisodeListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <ul className="grid grid-cols-1 gap-x-8 gap-y-8 lg:grid-cols-2">
      {Array.from({ length: count }, (_, i) => (
        <li key={i} className="flex gap-4">
          <div className="skeleton aspect-video w-40 shrink-0 rounded-card md:w-52" />
          <div className="flex-1 space-y-2 py-1">
            <div className="skeleton h-2.5 w-16 rounded-[3px]" />
            <div className="skeleton h-3.5 w-3/5 rounded-[3px]" />
            <div className="skeleton h-2.5 w-full rounded-[3px]" />
            <div className="skeleton h-2.5 w-4/5 rounded-[3px]" />
          </div>
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

/** Mirrors `PageHeader`, minus the wash. */
export function PageHeaderSkeleton() {
  return (
    <div className="border-b border-line">
      <div className="page space-y-5 pt-32 pb-14 md:pt-40 md:pb-20">
        <div className="skeleton h-2.5 w-24 rounded-[3px]" />
        <div className="skeleton h-12 w-56 rounded-card md:h-16" />
        <div className="skeleton h-3 w-80 max-w-full rounded-[3px]" />
      </div>
    </div>
  );
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
