import { Suspense } from "react";
import { Section } from "./Section";
import { MediaCard } from "./MediaCard";
import { Rail } from "./Rail";
import { PosterRailSkeleton, SectionSkeleton } from "./LoadingSkeleton";
import { currentSeason, getSeasonalAnime } from "@/lib/mal";

/*
 * MAL entries carry no TMDB id, so a card cannot link to a title page
 * directly. It links to oovi's own search for the English title instead,
 * which costs nothing until the viewer clicks.
 */
async function Rows() {
  const items = await getSeasonalAnime();
  if (!items.length) return null;
  const { label } = currentSeason();

  return (
    <Section title={`This season · ${label}`} bleed>
      <Rail label={`Anime airing ${label}`}>
        {items.map((item) => (
          <div key={item.malId} className="rail-item w-[148px] md:w-[184px]">
            <MediaCard
              media={{
                tmdbId: item.malId,
                imdbId: null,
                type: "tv",
                title: item.title,
                posterPath: null,
                backdropPath: null,
                overview: "",
                releaseDate: item.startDate,
                rating: item.score ?? 0,
                genres: [],
              }}
              href={`/search?q=${encodeURIComponent(item.title)}&type=tv`}
              imageSrc={item.imageUrl}
              sizes="(min-width: 768px) 184px, 148px"
            />
          </div>
        ))}
      </Rail>
    </Section>
  );
}

export function AnimeSeasonRail() {
  return (
    <Suspense
      fallback={
        <SectionSkeleton bleed>
          <PosterRailSkeleton />
        </SectionSkeleton>
      }
    >
      <Rows />
    </Suspense>
  );
}
