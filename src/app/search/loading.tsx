import { GridSkeleton, LoadingPage } from "@/components/LoadingSkeleton";

/* The results page: eyebrow, quoted query, the three type pills, the grid. */
export default function SearchLoading() {
  return (
    <LoadingPage>
      <div className="pt-32 pb-20 md:pt-40">
        <div className="page">
          <div className="skeleton h-2.5 w-16 rounded-full" />
          <div className="skeleton mt-5 h-12 w-64 rounded-card md:h-16" />
          <div className="mt-8 flex gap-2">
            {["w-14", "w-20", "w-20"].map((width, i) => (
              <div key={i} className={`skeleton h-10 rounded-full ${width}`} />
            ))}
          </div>
        </div>
        <div className="page mt-12">
          <div className="skeleton h-3 w-20 rounded-full" />
          <div className="mt-6">
            <GridSkeleton count={12} />
          </div>
        </div>
      </div>
    </LoadingPage>
  );
}
