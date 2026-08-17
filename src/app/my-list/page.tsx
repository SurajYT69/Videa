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
        title="My List"
        description="Saved on this device. Nothing here leaves your browser."
      />
      <ContinueWatchingSection showWhenEmpty />
      <FavoritesSection showWhenEmpty />
      <RecentlyViewedSection showWhenEmpty />
    </>
  );
}
