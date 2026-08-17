import { GridSkeleton } from "@/components/LoadingSkeleton";

export default function SearchLoading() {
  return (
    <div className="pt-28 pb-16 md:pt-36">
      <div className="page">
        <div className="skeleton h-10 w-64 rounded-card md:h-14" />
        <div className="skeleton mt-5 h-2.5 w-24 rounded-[3px]" />
      </div>
      <div className="page mt-10">
        <GridSkeleton count={12} />
      </div>
    </div>
  );
}
