import { EpisodeCard } from "./EpisodeCard";
import type { Episode } from "@/lib/types";

type Props = {
  episodes: Episode[];
  tvId: number;
  resumeAt?: { season: number; episode: number } | null;
};

export function EpisodeList({ episodes, tvId, resumeAt }: Props) {
  if (!episodes.length) {
    return (
      <p className="text-sm text-fg-2">
        No episodes have been listed for this season yet.
      </p>
    );
  }

  return (
    <ul className="grid grid-cols-1 gap-x-8 gap-y-8 lg:grid-cols-2">
      {episodes.map((episode) => (
        <li key={`${episode.seasonNumber}-${episode.episodeNumber}`}>
          <EpisodeCard
            episode={episode}
            tvId={tvId}
            isResume={
              resumeAt?.season === episode.seasonNumber &&
              resumeAt?.episode === episode.episodeNumber
            }
          />
        </li>
      ))}
    </ul>
  );
}
