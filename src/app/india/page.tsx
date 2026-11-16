import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHero } from "@/components/PageHero";
import { HeroSkeleton } from "@/components/LoadingSkeleton";
import { DiscoverRail } from "@/components/DiscoverRail";
import { NewOnRail, UpcomingHindiRail, isoDay } from "@/components/IndiaRails";
import { discover } from "@/lib/tmdb";
import { INDIA_PROVIDERS } from "@/lib/tmdb-options";

export const metadata: Metadata = {
  title: "India",
  description: "New on Indian streaming services, new Telugu and Tamil films, and Hindi releases on the way.",
};

/* The slider: the most popular Hindi films released in the last two months. */
async function IndiaHero() {
  const { items } = await discover("movie", {
    language: "hi",
    from: isoDay(-60),
    to: isoDay(),
    minVotes: 0,
  }).catch(() => ({ items: [] }));
  return <PageHero items={items} eyebrow="India · New releases" />;
}

export default function IndiaPage() {
  /* Rails alternate ground and band down the page; a rail that comes back
     thin renders nothing, which can put two of a tone together. */
  const tone = (i: number): "band" | "ground" => (i % 2 === 0 ? "band" : "ground");
  const THIS_MONTH = { from: isoDay(-30), to: isoDay(), minVotes: 0 };

  return (
    <>
      <Suspense fallback={<HeroSkeleton />}>
        <IndiaHero />
      </Suspense>

      <UpcomingHindiRail tone="band" />
      <DiscoverRail
        title="New Telugu films this month"
        type="movie"
        params={{ ...THIS_MONTH, language: "te" }}
      />
      <DiscoverRail
        title="New Tamil films this month"
        type="movie"
        params={{ ...THIS_MONTH, language: "ta" }}
        tone="band"
      />
      {INDIA_PROVIDERS.map((p, i) => (
        <NewOnRail key={p.id} id={p.id} name={p.name} tone={tone(i + 1)} />
      ))}
    </>
  );
}
