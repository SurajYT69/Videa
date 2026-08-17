import {
  GridSkeleton,
  PosterRailSkeleton,
  SectionHeadingSkeleton,
} from "@/components/LoadingSkeleton";

export default function BrowseLoading() {
  return (
    <>
      <div className="page border-b border-line pt-28 pb-10 md:pt-36 md:pb-14">
        <div className="skeleton h-12 w-56 rounded-card md:h-16" />
        <div className="skeleton mt-5 h-3 w-80 max-w-full rounded-[3px]" />
      </div>
      <section className="py-10 md:py-14">
        <SectionHeadingSkeleton />
        <div className="mt-6">
          <PosterRailSkeleton />
        </div>
      </section>
      <section className="py-10 md:py-14">
        <SectionHeadingSkeleton />
        <div className="page mt-6">
          <GridSkeleton count={12} />
        </div>
      </section>
    </>
  );
}
