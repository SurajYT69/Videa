import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import {
  ContinueWatchingSection,
  FavoritesSection,
  RecentlyViewedSection,
} from "@/components/LibrarySections";

export const metadata: Metadata = {
  title: "My List",
  description: "Everything you have saved, started, or looked at.",
  robots: { index: false, follow: true },
};

export default function MyListPage() {
  return (
    <>
      <PageHeader
        eyebrow="On this device"
        title="My List"
        description="Saved locally in this browser. No account, no server copy, nothing to sign into."
      />
      <ContinueWatchingSection showWhenEmpty />
      <FavoritesSection showWhenEmpty tone="band" />
      <RecentlyViewedSection showWhenEmpty />
    </>
  );
}
