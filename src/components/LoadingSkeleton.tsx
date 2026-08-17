/**
 * Skeletons mirror the shape of what they replace. No generic spinners.
 */

export function HeroSkeleton() {
  return (
    <div className="relative flex min-h-[600px] items-end overflow-hidden md:min-h-[84dvh]">
      <div className="skeleton absolute inset-0" />
      <div className="scrim-bottom absolute inset-x-0 bottom-0 h-4/5" />
      <div className="page relative w-full pt-24 pb-14 md:pb-20">
        <div className="max-w-xl space-y-5">
          <div className="skeleton h-12 w-3/4 rounded-card md:h-16" />
          <div className="skeleton h-3 w-52 rounded-[3px]" />
          <div className="space-y-2">
            <div className="skeleton h-3 w-full rounded-[3px]" />
            <div className="skeleton h-3 w-4/5 rounded-[3px]" />
          </div>
          <div className="flex gap-3 pt-3">
            <div className="skeleton h-12 w-36 rounded-card" />
            <div className="skeleton h-12 w-28 rounded-card" />
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
      <div className="skeleton mt-3 h-3 w-4/5 rounded-[3px]" />
      <div className="skeleton mt-2 h-2.5 w-2/5 rounded-[3px]" />
    </div>
  );
}

export function GridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {Array.from({ length: count }, (_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

export function PosterRailSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="flex gap-4 overflow-hidden px-5 md:px-8 xl:px-12">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="w-[136px] shrink-0 md:w-[168px]">
          <CardSkeleton />
        </div>
      ))}
    </div>
  );
}

export function TrendingRailSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="flex gap-4 overflow-hidden px-5 md:px-8 xl:px-12">
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className="skeleton aspect-video w-[268px] shrink-0 rounded-card md:w-[380px]"
        />
      ))}
    </div>
  );
}

export function SectionHeadingSkeleton() {
  return (
    <div className="page">
      <div className="skeleton h-6 w-44 rounded-mini" />
    </div>
  );
}

export function DetailsSkeleton() {
  return (
    <div>
      <div className="skeleton relative h-[46vh] min-h-[320px] w-full md:h-[62vh]" />
      <div className="page -mt-24 grid grid-cols-1 gap-8 pb-12 md:grid-cols-12 md:gap-10">
        <div className="hidden md:col-span-3 md:block lg:col-span-3">
          <div className="skeleton aspect-2/3 w-full rounded-card" />
        </div>
        <div className="space-y-5 md:col-span-9">
          <div className="skeleton h-10 w-2/3 rounded-card md:h-14" />
          <div className="skeleton h-3 w-64 rounded-[3px]" />
          <div className="flex gap-2">
            <div className="skeleton h-7 w-20 rounded-card" />
            <div className="skeleton h-7 w-24 rounded-card" />
          </div>
          <div className="space-y-2">
            <div className="skeleton h-3 w-full rounded-[3px]" />
            <div className="skeleton h-3 w-11/12 rounded-[3px]" />
            <div className="skeleton h-3 w-3/5 rounded-[3px]" />
          </div>
          <div className="skeleton h-12 w-40 rounded-card" />
        </div>
      </div>
    </div>
  );
}

export function EpisodeListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <ul className="grid grid-cols-1 gap-x-6 gap-y-8 lg:grid-cols-2">
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
        <div key={i} className="skeleton h-9 w-24 rounded-card" />
      ))}
    </div>
  );
}

export function PlayerSkeleton() {
  return <div className="skeleton aspect-video w-full rounded-card" />;
}
