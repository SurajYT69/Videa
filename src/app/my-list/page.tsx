import type { Metadata } from "next";
import {
  LibraryHeader,
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
      <LibraryHeader />
      <ContinueWatchingSection showWhenEmpty />
      <FavoritesSection showWhenEmpty tone="band" />
      <RecentlyViewedSection showWhenEmpty />
    </>
  );
}
