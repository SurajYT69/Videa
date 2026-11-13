import { EpisodeCard } from "./EpisodeCard";
import { Rail } from "./Rail";
import type { Episode } from "@/lib/types";

type Props = {
  episodes: Episode[];
  tvId: number;
  resumeAt?: { season: number; episode: number } | null;
};

/** One season as a single scrolling row, like every other rail on the site. */
export function EpisodeList({ episodes, tvId, resumeAt }: Props) {
  if (!episodes.length) {
    return (
      <p className="page text-sm text-fg-2">
        No episodes have been listed for this season yet.
      </p>
    );
  }

  return (
    <Rail label="Episodes">
      {episodes.map((episode) => (
        <div
          key={`${episode.seasonNumber}-${episode.episodeNumber}`}
          className="rail-item w-[240px] md:w-[264px]"
        >
          <EpisodeCard
            episode={episode}
            tvId={tvId}
            isResume={
              resumeAt?.season === episode.seasonNumber &&
              resumeAt?.episode === episode.episodeNumber
            }
          />
        </div>
      ))}
    </Rail>
  );
}
