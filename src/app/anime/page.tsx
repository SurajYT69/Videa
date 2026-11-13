import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHero } from "@/components/PageHero";
import { HeroSkeleton } from "@/components/LoadingSkeleton";
import { discover } from "@/lib/tmdb";
import { DiscoverRail } from "@/components/DiscoverRail";
import { AnimeSeasonRail } from "@/components/AnimeSeasonRail";

export const metadata: Metadata = {
  title: "Anime",
  description: "Japanese animation: the series and films people are watching.",
};

/* TMDB's Animation genre, narrowed to Japanese originals: the same rule
   `lib/mal.ts` uses to decide a title is anime. */
const ANIME = { genres: [16], language: "ja" };

/* The slider shows the most popular anime series right now. */
async function AnimeHero() {
  const { items } = await discover("tv", ANIME).catch(() => ({ items: [] }));
  return <PageHero items={items} eyebrow="Anime · Popular now" />;
}

export default function AnimePage() {
  return (
    <>
      <Suspense fallback={<HeroSkeleton />}>
        <AnimeHero />
      </Suspense>

      <AnimeSeasonRail />
      <DiscoverRail title="Popular series" type="tv" params={ANIME} tone="band" />
      <DiscoverRail title="Popular films" type="movie" params={ANIME} />
      <DiscoverRail
        title="Top rated series"
        type="tv"
        params={{ ...ANIME, sort: "vote_average.desc" }}
        tone="band"
      />
      <DiscoverRail
        title="Top rated films"
        type="movie"
        params={{ ...ANIME, sort: "vote_average.desc" }}
      />
    </>
  );
}
