import {
  DetailsSkeleton,
  EpisodeListSkeleton,
  SeasonSelectorSkeleton,
  SectionHeadingSkeleton,
} from "@/components/LoadingSkeleton";

export default function TVLoading() {
  return (
    <>
      <DetailsSkeleton />
      <section className="py-10 md:py-14">
        <SectionHeadingSkeleton />
        <div className="page mt-6 space-y-8">
          <SeasonSelectorSkeleton />
          <EpisodeListSkeleton />
        </div>
      </section>
    </>
  );
}
