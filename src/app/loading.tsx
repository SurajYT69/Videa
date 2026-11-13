import {
  GridSkeleton,
  HeroSkeleton,
  SectionSkeleton,
  PosterRailSkeleton,
} from "@/components/LoadingSkeleton";

export default function HomeLoading() {
  return (
    <>
      <HeroSkeleton />
      <SectionSkeleton bleed>
        <PosterRailSkeleton />
      </SectionSkeleton>
      <SectionSkeleton>
        <GridSkeleton count={12} />
      </SectionSkeleton>
    </>
  );
}
