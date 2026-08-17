import {
  GridSkeleton,
  HeroSkeleton,
  SectionHeadingSkeleton,
  TrendingRailSkeleton,
} from "@/components/LoadingSkeleton";

export default function HomeLoading() {
  return (
    <>
      <HeroSkeleton />
      <section className="py-10 md:py-14">
        <SectionHeadingSkeleton />
        <div className="mt-6">
          <TrendingRailSkeleton />
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
