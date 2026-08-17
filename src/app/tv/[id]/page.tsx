import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DetailBackdrop } from "@/components/DetailBackdrop";
import { Poster } from "@/components/Poster";
import { Rating } from "@/components/Rating";
import { GenreBadge } from "@/components/GenreBadge";
import { Section } from "@/components/Section";
import { CastRail } from "@/components/CastRail";
import { MediaGrid } from "@/components/MediaGrid";
import { SeasonSelector } from "@/components/SeasonSelector";
import { FavoriteButton } from "@/components/FavoriteButton";
import { ResumeButton } from "@/components/ResumeButton";
import { ViewRecorder } from "@/components/ViewRecorder";
import {
  EpisodeListSkeleton,
  GridSkeleton,
  SectionSkeleton,
} from "@/components/LoadingSkeleton";
import { BACKDROP, tmdbImage } from "@/lib/images";
import { runtimeLabel, year } from "@/lib/format";
import { toStub } from "@/lib/stub";
import { getSeason, getSimilar, getTV } from "@/lib/tmdb";
import type { SeasonSummary } from "@/lib/types";

type Props = { params: Promise<{ id: string }> };

function parseId(raw: string): number | null {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const parsed = parseId(id);
  if (!parsed) return { title: "Title not found" };

  const show = await getTV(parsed).catch(() => null);
  if (!show) return { title: "Title not found" };

  const started = year(show.releaseDate);
  const title = started ? `${show.title} (${started})` : show.title;
  const description =
    show.overview.slice(0, 180) || `Watch ${show.title} on Videa.`;
  const image = tmdbImage(show.backdropPath, BACKDROP.lg);

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "video.tv_show",
      images: image ? [{ url: image, width: 1280, height: 720 }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

/*
 * Only the first season is fetched, and it streams. The title, artwork and
 * Resume button do not wait on it, and no other season is requested until the
 * viewer actually opens one.
 */
async function Episodes({
  tvId,
  seasons,
}: {
  tvId: number;
  seasons: SeasonSummary[];
}) {
  const first = seasons[0]?.seasonNumber ?? 1;
  const initialSeason = await getSeason(tvId, first).catch(() => null);

  return (
    <SeasonSelector
      tvId={tvId}
      seasons={seasons}
      initialSeason={initialSeason}
    />
  );
}

async function SimilarShows({ id }: { id: number }) {
  const similar = await getSimilar("tv", id).catch(() => []);
  if (!similar.length) return null;

  return (
    <Section title="More like this" eyebrow="Keep going" tone="band">
      <MediaGrid items={similar.slice(0, 12)} />
    </Section>
  );
}

export default async function TVDetailsPage({ params }: Props) {
  const { id } = await params;
  const parsed = parseId(id);
  if (!parsed) notFound();

  const show = await getTV(parsed);
  if (!show) notFound();

  const firstSeason = show.seasons[0]?.seasonNumber ?? 1;
  const started = year(show.releaseDate);
  const seasonCount = show.seasons.length;
  const runtime = runtimeLabel(show.episodeRunTime);

  return (
    <>
      <ViewRecorder stub={toStub(show)} />
      <DetailBackdrop path={show.backdropPath} />

      <div className="page -mt-28 pb-4 md:-mt-40">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-12 md:gap-12">
          <div className="hidden md:col-span-4 md:block lg:col-span-3">
            <div className="relative aspect-2/3 overflow-hidden rounded-card bg-surface shadow-lift">
              <Poster
                path={show.posterPath}
                title={show.title}
                sizes="(min-width: 1280px) 320px, 280px"
                size="lg"
                priority
              />
              <div className="pointer-events-none absolute inset-0 rounded-card art-edge" />
            </div>
          </div>

          <div className="md:col-span-8 md:pt-20 lg:col-span-8 lg:pt-24">
            <div className="flex items-center gap-3">
              <span className="h-px w-8 bg-fg-3/50" />
              <span className="eyebrow">Series</span>
            </div>

            <h1 className="display display-page mt-5 max-w-[18ch] text-fg text-balance">
              {show.title}
            </h1>

            <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2">
              <Rating value={show.rating} />
              {started && (
                <>
                  <Dot />
                  <span className="meta">{started}</span>
                </>
              )}
              {seasonCount > 0 && (
                <>
                  <Dot />
                  <span className="meta">
                    {seasonCount} Season{seasonCount === 1 ? "" : "s"}
                  </span>
                </>
              )}
              {runtime && (
                <>
                  <Dot />
                  <span className="meta">{runtime} per episode</span>
                </>
              )}
              {show.status && (
                <>
                  <Dot />
                  <span className="meta">{show.status}</span>
                </>
              )}
            </div>

            {show.genres.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2">
                {show.genres.map((genre) => (
                  <GenreBadge key={genre} label={genre} />
                ))}
              </div>
            )}

            {show.overview && (
              <p className="mt-7 max-w-[64ch] text-[15px] leading-relaxed text-fg-2 md:text-base">
                {show.overview}
              </p>
            )}

            {show.creators.length > 0 && (
              <p className="meta mt-6">
                Created by{" "}
                <span className="text-fg-2">{show.creators.join(", ")}</span>
              </p>
            )}

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <ResumeButton
                tvId={show.tmdbId}
                startSeason={firstSeason}
                startEpisode={1}
              />
              <FavoriteButton stub={toStub(show)} />
            </div>
          </div>
        </div>
      </div>

      {show.seasons.length > 0 && (
        <Section title="Episodes" eyebrow="Season by season">
          <Suspense fallback={<EpisodeListSkeleton />}>
            <Episodes tvId={show.tmdbId} seasons={show.seasons} />
          </Suspense>
        </Section>
      )}

      {show.cast.length > 0 && (
        <Section title="Cast" eyebrow="Who's in it" bleed>
          <CastRail cast={show.cast} />
        </Section>
      )}

      <Suspense
        fallback={
          <SectionSkeleton>
            <GridSkeleton count={6} />
          </SectionSkeleton>
        }
      >
        <SimilarShows id={parsed} />
      </Suspense>
    </>
  );
}

function Dot() {
  return (
    <span aria-hidden="true" className="size-[3px] rounded-full bg-fg-3/50" />
  );
}
