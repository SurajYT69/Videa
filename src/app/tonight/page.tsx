import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Shuffle } from "@phosphor-icons/react/dist/ssr";
import { MediaCard } from "@/components/MediaCard";
import { EmptyState } from "@/components/EmptyState";
import { PosterWall } from "@/components/PosterWall";
import { ConfigError, discover, type DiscoverParams } from "@/lib/tmdb";
import {
  TONIGHT_MOODS,
  TONIGHT_TIMES,
  type TonightMood,
  type TonightTime,
} from "@/lib/tmdb-options";
import type { MediaItem } from "@/lib/types";

export const metadata: Metadata = {
  title: "Tonight",
  description: "Three taps: a mood, how long you have, then five picks.",
};

type Props = {
  searchParams: Promise<{ mood?: string; time?: string; deal?: string }>;
};

/* Measured: ~167px at 390 (2 up), ~238px at 1440 (5 up beside the rail). */
const SIZES = "(min-width: 1024px) 19vw, (min-width: 640px) 30vw, 45vw";

const newDeal = () => Math.floor(Math.random() * 1_000_000);

function href(mood?: string, time?: string, deal?: number) {
  const q = new URLSearchParams();
  if (mood) q.set("mood", mood);
  if (time) q.set("time", time);
  if (deal !== undefined) q.set("deal", String(deal));
  const s = q.toString();
  return s ? `/tonight?${s}` : "/tonight";
}

/* Seeded so a shared link deals the same five. mulberry32. */
function seeded(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/*
 * Page one tells us how many pages exist (and is cached for six hours, so it
 * is usually free); the seed then picks one of the first ten and shuffles it.
 * Past page ten the floor is still met but the titles get obscure.
 */
async function Deal({ mood, time, seed }: { mood: TonightMood; time: TonightTime; seed: number }) {
  const params: DiscoverParams = {
    genres: [...mood[time.type]],
    minVotes: time.type === "movie" ? 300 : 150,
    minRating: 6.5,
    minRuntime: "minRuntime" in time ? time.minRuntime : undefined,
    maxRuntime: "maxRuntime" in time ? time.maxRuntime : undefined,
  };

  let picks: MediaItem[];
  try {
    const first = await discover(time.type, params);
    const page = (seed % Math.min(Math.max(first.totalPages, 1), 10)) + 1;
    const { items } = page === 1 ? first : await discover(time.type, { ...params, page });
    const rand = seeded(seed);
    picks = items
      .filter((item) => item.posterPath)
      .map((item) => ({ item, key: rand() }))
      .sort((a, b) => a.key - b.key)
      .slice(0, 5)
      .map(({ item }) => item);
  } catch (error) {
    if (error instanceof ConfigError) throw error;
    picks = [];
  }

  if (!picks.length) {
    return (
      <EmptyState
        title="Nothing in the deck"
        description="That mood and length came back empty. Try another mood, or deal again."
        action={{ href: href(mood.id, time.id, newDeal()), label: "Deal again" }}
        secondary={{ href: "/tonight", label: "Start over" }}
      />
    );
  }

  return (
    <ul className={GRID}>
      {picks.map((item) => (
        <li key={item.tmdbId}>
          <MediaCard media={item} sizes={SIZES} />
        </li>
      ))}
    </ul>
  );
}

const GRID = "grid grid-cols-2 gap-x-4 gap-y-9 sm:grid-cols-3 md:gap-x-5 lg:grid-cols-5";

function DealSkeleton() {
  return (
    <div aria-hidden="true" className={GRID}>
      {Array.from({ length: 5 }, (_, i) => (
        <div key={i} className="skeleton aspect-2/3 rounded-card" />
      ))}
    </div>
  );
}

function Pill({ to, label, on }: { to: string; label: string; on: boolean }) {
  return (
    <Link
      href={to}
      aria-current={on ? "true" : undefined}
      className={`inline-flex h-11 items-center rounded-full px-5 text-sm font-medium whitespace-nowrap transition-colors duration-200 ${
        on ? "bg-fg text-ink" : "glass text-fg-2 hover:text-fg"
      }`}
    >
      {label}
    </Link>
  );
}

function Step({ n, label, children }: { n: number; label: string; children: React.ReactNode }) {
  return (
    <div className="mt-8">
      <p className="eyebrow">
        <span className="font-mono">{n}</span> · {label}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

export default async function TonightPage({ searchParams }: Props) {
  const sp = await searchParams;
  const mood = TONIGHT_MOODS.find((m) => m.id === sp.mood);
  const time = mood ? TONIGHT_TIMES.find((t) => t.id === sp.time) : undefined;
  const parsed = Number.parseInt(sp.deal ?? "", 10);
  const seed = Number.isFinite(parsed) && parsed >= 0 ? parsed : newDeal();

  return (
    <>
      <div className="relative isolate overflow-hidden pb-6 md:-ml-18 md:pl-18">
        <PosterWall />
        <div className="page pt-32 pb-4 md:pt-40">
          <p className="eyebrow">Tonight</p>
          <h1 className="display display-page mt-5 text-fg">What should I watch?</h1>

          <Step n={1} label="Mood">
            {TONIGHT_MOODS.map((m) => (
              <Pill
                key={m.id}
                to={href(m.id, time?.id, time ? newDeal() : undefined)}
                label={m.label}
                on={m.id === mood?.id}
              />
            ))}
          </Step>

          {mood && (
            <Step n={2} label="Time">
              {TONIGHT_TIMES.map((t) => (
                <Pill key={t.id} to={href(mood.id, t.id, newDeal())} label={t.label} on={t.id === time?.id} />
              ))}
            </Step>
          )}
        </div>
      </div>

      {mood && time && (
        <section className="page pt-4 pb-14">
          <Suspense key={`${mood.id}-${time.id}-${seed}`} fallback={<DealSkeleton />}>
            <Deal mood={mood} time={time} seed={seed} />
          </Suspense>

          <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3">
            <Link
              href={href(mood.id, time.id, newDeal())}
              className="inline-flex h-12 items-center gap-2 rounded-full bg-fg px-6 text-sm font-medium whitespace-nowrap text-ink transition duration-200 hover:-translate-y-px hover:shadow-lift active:translate-y-0"
            >
              <Shuffle className="size-4" aria-hidden="true" />
              Deal again
            </Link>
            <Link
              href="/tonight"
              className="text-sm whitespace-nowrap text-fg-2 underline decoration-line-strong underline-offset-4 transition-colors duration-200 hover:text-fg hover:decoration-fg-3"
            >
              Start over
            </Link>
          </div>
        </section>
      )}
    </>
  );
}
