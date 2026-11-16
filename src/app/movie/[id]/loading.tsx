import { DetailsSkeleton, LoadingPage } from "@/components/LoadingSkeleton";

export default function MovieLoading() {
  return (
    <LoadingPage>
      <DetailsSkeleton />
    </LoadingPage>
  );
}
