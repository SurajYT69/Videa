import {
  GridSkeleton,
  PageHeaderSkeleton,
  PosterRailSkeleton,
  SectionSkeleton,
} from "@/components/LoadingSkeleton";

export default function BrowseLoading() {
  return (
    <>
      <PageHeaderSkeleton />
      <SectionSkeleton bleed>
        <PosterRailSkeleton />
      </SectionSkeleton>
      <SectionSkeleton>
        <GridSkeleton count={12} />
      </SectionSkeleton>
    </>
  );
}
