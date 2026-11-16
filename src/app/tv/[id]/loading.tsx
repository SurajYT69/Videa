import {
  DetailsSkeleton,
  EpisodeListSkeleton,
  LoadingPage,
  SectionSkeleton,
  SeasonSelectorSkeleton,
} from "@/components/LoadingSkeleton";

export default function TVLoading() {
  return (
    <LoadingPage>
      <DetailsSkeleton />
      <SectionSkeleton>
        <div className="space-y-10">
          <SeasonSelectorSkeleton />
          <EpisodeListSkeleton />
        </div>
      </SectionSkeleton>
    </LoadingPage>
  );
}
