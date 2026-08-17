import { GridSkeleton } from "@/components/LoadingSkeleton";

export default function SearchLoading() {
  return (
    <div className="pt-32 pb-20 md:pt-40">
      <div className="page space-y-5">
        <div className="skeleton h-2.5 w-24 rounded-[3px]" />
        <div className="skeleton h-12 w-64 rounded-card md:h-16" />
      </div>
      <div className="page mt-12">
        <GridSkeleton count={12} />
      </div>
    </div>
  );
}
