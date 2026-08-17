import {
  GridSkeleton,
  PageHeaderSkeleton,
  SectionSkeleton,
  TrendingRailSkeleton,
} from "@/components/LoadingSkeleton";

export default function TVBrowseLoading() {
  return (
    <>
      <PageHeaderSkeleton />
      <SectionSkeleton bleed>
        <TrendingRailSkeleton />
      </SectionSkeleton>
      <SectionSkeleton>
        <GridSkeleton count={12} />
      </SectionSkeleton>
    </>
  );
}
