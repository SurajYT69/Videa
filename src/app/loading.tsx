import {
  HeroSkeleton,
  LoadingPage,
  PosterRailSkeleton,
  SectionSkeleton,
  TrendingRailSkeleton,
} from "@/components/LoadingSkeleton";

/* Home is all rails below the hero, never a grid. */
export default function HomeLoading() {
  return (
    <LoadingPage>
      <HeroSkeleton />
      <SectionSkeleton bleed>
        <TrendingRailSkeleton />
      </SectionSkeleton>
      <SectionSkeleton bleed>
        <PosterRailSkeleton />
      </SectionSkeleton>
    </LoadingPage>
  );
}
