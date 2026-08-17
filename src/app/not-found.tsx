import { ErrorState } from "@/components/ErrorState";

export default function NotFound() {
  return (
    <ErrorState
      title="We couldn't find that title."
      description="The link may be out of date, or the title may no longer be listed. Try searching for it by name."
    />
  );
}
