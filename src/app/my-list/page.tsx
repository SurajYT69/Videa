import type { Metadata } from "next";
import { LibraryHeader, MyListSections } from "@/components/LibrarySections";
import { PosterWall } from "@/components/PosterWall";

export const metadata: Metadata = {
  title: "My List",
  description: "Everything you have saved, started, or looked at.",
  robots: { index: false, follow: true },
};

export default function MyListPage() {
  return (
    <>
      <div className="relative isolate overflow-hidden pb-6 md:-ml-18 md:pl-18">
        <PosterWall />
        <LibraryHeader />
      </div>
      <MyListSections />
    </>
  );
}
