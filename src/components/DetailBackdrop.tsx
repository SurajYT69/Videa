import Image from "next/image";
import { BACKDROP, tmdbImage } from "@/lib/images";

/**
 * Full-bleed establishing frame. Content below overlaps it, so the scrim is
 * weighted to the bottom third and the top stays open.
 */
export function DetailBackdrop({ path }: { path: string | null }) {
  const src = tmdbImage(path, BACKDROP.lg);

  return (
    <div className="relative -z-10 h-[42vh] min-h-[280px] w-full overflow-hidden md:h-[58vh]">
      {src ? (
        <Image
          src={src}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-top"
        />
      ) : (
        <div className="absolute inset-0 bg-surface" />
      )}
      <div className="scrim-bottom absolute inset-x-0 bottom-0 h-3/4" />
      <div className="absolute inset-0 bg-ink/25" />
    </div>
  );
}
