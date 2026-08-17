import Image from "next/image";
import Link from "next/link";
import { Play } from "@phosphor-icons/react/dist/ssr";
import { STILL, tmdbImage } from "@/lib/images";
import { airDateLabel, episodeCode, metaLine, runtimeLabel } from "@/lib/format";
import { watchHref } from "@/lib/playback";
import type { Episode } from "@/lib/types";

type Props = {
  episode: Episode;
  tvId: number;
  /** True when this is where the viewer left off. */
  isResume?: boolean;
};

export function EpisodeCard({ episode, tvId, isResume = false }: Props) {
  const src = tmdbImage(episode.stillPath, STILL.md);
  const code = episodeCode(episode.seasonNumber, episode.episodeNumber);

  return (
    <Link
      href={watchHref("tv", tvId, episode.seasonNumber, episode.episodeNumber)}
      className="group flex gap-4 rounded-card"
    >
      <div className="relative aspect-video w-36 shrink-0 overflow-hidden rounded-card bg-surface sm:w-44 md:w-52">
        {src ? (
          <Image
            src={src}
            alt=""
            fill
            sizes="208px"
            className="object-cover transition-transform duration-500 ease-out-expo group-hover:scale-[1.05]"
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center">
            <span className="font-mono text-sm text-fg-3">{code}</span>
          </div>
        )}

        <span className="absolute inset-0 grid place-items-center bg-fg/30 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <span className="grid size-9 place-items-center rounded-full bg-white text-fg">
            <Play weight="fill" className="size-4" aria-hidden="true" />
          </span>
        </span>

        <span className="pointer-events-none absolute inset-0 rounded-card art-edge" />
      </div>

      <div className="min-w-0 flex-1 py-0.5">
        <p className="meta">
          {code}
          {isResume && (
            <span className="text-accent">{"  ·  Continue"}</span>
          )}
        </p>
        <h3 className="mt-1.5 line-clamp-1 text-sm font-medium text-fg transition-colors group-hover:text-white">
          {episode.name}
        </h3>
        <p className="meta mt-1">
          {metaLine(runtimeLabel(episode.runtime), airDateLabel(episode.airDate))}
        </p>
        {episode.overview && (
          <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-fg-2">
            {episode.overview}
          </p>
        )}
      </div>
    </Link>
  );
}
