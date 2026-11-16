import { tmdbImage } from "./images";
import type { MediaItem } from "./types";

/** The slider's up-next still: TMDB's w300, 112px wide on screen. */
export function heroThumb(item: MediaItem) {
  return { title: item.title, src: tmdbImage(item.backdropPath, "w300") };
}
