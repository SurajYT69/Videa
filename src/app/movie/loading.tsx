import {
  GridSkeleton,
  HeroSkeleton,
  PosterRailSkeleton,
  SectionSkeleton,
} from "@/components/LoadingSkeleton";

export default function BrowseLoading() {
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
