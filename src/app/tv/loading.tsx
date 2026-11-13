import {
  GridSkeleton,
  HeroSkeleton,
  SectionSkeleton,
  TrendingRailSkeleton,
} from "@/components/LoadingSkeleton";

export default function TVBrowseLoading() {
  return (
    <>
      <HeroSkeleton />
      <SectionSkeleton bleed>
        <TrendingRailSkeleton />
      </SectionSkeleton>
      <SectionSkeleton>
        <GridSkeleton count={12} />
      </SectionSkeleton>
    </>
  );
}
