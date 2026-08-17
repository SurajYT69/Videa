import { PlayerSkeleton } from "@/components/LoadingSkeleton";

export default function WatchLoading() {
  return (
    <div className="mx-auto w-full max-w-[1360px] px-4 pt-20 md:px-8 md:pt-24">
      <div className="skeleton my-4 h-3 w-40 rounded-[3px]" />
      <PlayerSkeleton />
      <div className="mt-10 space-y-4 border-t border-line pt-8">
        <div className="skeleton h-2.5 w-32 rounded-[3px]" />
        <div className="skeleton h-8 w-2/5 rounded-card" />
        <div className="skeleton h-2.5 w-56 rounded-[3px]" />
        <div className="skeleton h-2.5 w-full max-w-[64ch] rounded-[3px]" />
        <div className="skeleton h-2.5 w-4/5 max-w-[52ch] rounded-[3px]" />
      </div>
    </div>
  );
}
