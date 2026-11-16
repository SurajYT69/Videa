import { Suspense } from "react";
import { Section } from "./Section";
import { PosterRail } from "./PosterRail";
import { Rail } from "./Rail";
import { MediaCard } from "./MediaCard";
import { PosterRailSkeleton, SectionSkeleton } from "./LoadingSkeleton";
import { discover } from "@/lib/tmdb";
import { airDateLabel } from "@/lib/format";
import type { MediaItem } from "@/lib/types";

type Tone = "ground" | "band";

/** ISO date `days` from today (negative for the past). */
export function isoDay(days = 0): string {
  return new Date(Date.now() + days * 86_400_000).toISOString().slice(0, 10);
}

function Streamed({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <SectionSkeleton bleed>
          <PosterRailSkeleton />
        </SectionSkeleton>
      }
    >
      {children}
    </Suspense>
  );
}

/*
 * Films and series that premiered in the last 30 days and stream on one
 * service in India. TMDB has no "date added to a service", so release date
 * stands in for it; a 7-day window left most services with two or three titles.
 */
async function NewOn({ id, name, tone }: { id: number; name: string; tone?: Tone }) {
  const recent = { provider: id, from: isoDay(-30), to: isoDay(), minVotes: 0 };
  const [films, shows] = await Promise.all([
    discover("movie", recent).then((p) => p.items, () => [] as MediaItem[]),
    discover("tv", recent).then((p) => p.items, () => [] as MediaItem[]),
  ]);

  /* Interleaved, so neither kind buries the other. */
  const items: MediaItem[] = [];
  for (let i = 0; i < Math.max(films.length, shows.length); i++) {
    if (shows[i]) items.push(shows[i]!);
    if (films[i]) items.push(films[i]!);
  }
  const shown = items.filter((item) => item.posterPath).slice(0, 18);
  /* A thin rail reads as broken; skip the service this month instead. */
  if (shown.length < 4) return null;

  const title = `New on ${name}`;
  return (
    <Section title={title} tone={tone} bleed>
      <PosterRail items={shown} label={title} />
    </Section>
  );
}

export function NewOnRail(props: { id: number; name: string; tone?: Tone }) {
  return (
    <Streamed>
      <NewOn {...props} />
    </Streamed>
  );
}

/* Hindi films with a release date from today on, soonest first. The date is
   the point of the rail, so it sits under each card. */
async function Upcoming({ tone }: { tone?: Tone }) {
  const { items } = await discover("movie", {
    language: "hi",
    from: isoDay(),
    sort: "primary_release_date.asc",
    minVotes: 0,
  }).catch(() => ({ items: [] as MediaItem[] }));
  const shown = items.filter((item) => item.posterPath).slice(0, 18);
  if (!shown.length) return null;

  const title = "Upcoming Hindi releases";
  return (
    <Section title={title} tone={tone} bleed>
      <Rail label={title}>
        {shown.map((item) => (
          <div key={item.tmdbId} className="rail-item w-[148px] md:w-[184px]">
            {/* Same measured widths as PosterRail. */}
            <MediaCard media={item} sizes="(min-width: 768px) 184px, 148px" />
            <p className="meta mt-1">{airDateLabel(item.releaseDate)}</p>
          </div>
        ))}
      </Rail>
    </Section>
  );
}

export function UpcomingHindiRail({ tone }: { tone?: Tone }) {
  return (
    <Streamed>
      <Upcoming tone={tone} />
    </Streamed>
  );
}
