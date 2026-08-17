import {
  DetailsSkeleton,
  EpisodeListSkeleton,
  SectionSkeleton,
  SeasonSelectorSkeleton,
} from "@/components/LoadingSkeleton";

export default function TVLoading() {
  return (
    <>
      <DetailsSkeleton />
      <SectionSkeleton>
        <div className="space-y-10">
          <SeasonSelectorSkeleton />
          <EpisodeListSkeleton />
        </div>
      </SectionSkeleton>
    </>
  );
}
