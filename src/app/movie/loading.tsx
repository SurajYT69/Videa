import {
  FilterBarSkeleton,
  GridSkeleton,
  HeroSkeleton,
  LoadingPage,
  PosterRailSkeleton,
  SectionSkeleton,
} from "@/components/LoadingSkeleton";

export default function BrowseLoading() {
  return (
    <LoadingPage>
      <HeroSkeleton />
      <SectionSkeleton bleed>
        <PosterRailSkeleton />
      </SectionSkeleton>
      <SectionSkeleton>
        <FilterBarSkeleton />
        <GridSkeleton count={12} />
      </SectionSkeleton>
    </LoadingPage>
  );
}
