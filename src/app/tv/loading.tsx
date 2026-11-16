import {
  FilterBarSkeleton,
  GridSkeleton,
  HeroSkeleton,
  LoadingPage,
  TrendingRailSkeleton,
  SectionSkeleton,
} from "@/components/LoadingSkeleton";

export default function TVBrowseLoading() {
  return (
    <LoadingPage>
      <HeroSkeleton />
      <SectionSkeleton bleed>
        <TrendingRailSkeleton />
      </SectionSkeleton>
      <SectionSkeleton>
        <FilterBarSkeleton />
        <GridSkeleton count={12} />
      </SectionSkeleton>
    </LoadingPage>
  );
}
