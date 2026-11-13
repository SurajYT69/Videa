import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FactTiles, TitleHero } from "@/components/TitleHero";
import { Section } from "@/components/Section";
import { CastRail } from "@/components/CastRail";
import { MediaGrid } from "@/components/MediaGrid";
import { SeasonSelector } from "@/components/SeasonSelector";
import { FavoriteButton } from "@/components/FavoriteButton";
import { ResumeButton } from "@/components/ResumeButton";
import { ResumeCard } from "@/components/ResumeCard";
import { ViewRecorder } from "@/components/ViewRecorder";
import {
  EpisodeListSkeleton,
  GridSkeleton,
  SectionSkeleton,
} from "@/components/LoadingSkeleton";
import { BACKDROP, tmdbImage } from "@/lib/images";
import { airDateLabel, runtimeLabel, year } from "@/lib/format";
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
    show.overview.slice(0, 180) || `Watch ${show.title} on oovi.`;
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
    <Section title="More like this" tone="band">
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
      <TitleHero
        title={show.title}
        kind="Series"
        backdropPath={show.backdropPath}
        logoPath={show.logoPath}
        rating={show.rating}
        facts={[
          started,
          show.genres.slice(0, 2).join(" & "),
          seasonCount > 0
            ? `${seasonCount} season${seasonCount === 1 ? "" : "s"}`
            : null,
          show.episodeCount > 0 ? `${show.episodeCount} episodes` : null,
          show.status,
        ]}
        overview={show.overview}
        providers={show.providers}
        aside={<ResumeCard tvId={show.tmdbId} backdropPath={show.backdropPath} />}
      >
        <ResumeButton
          tvId={show.tmdbId}
          startSeason={firstSeason}
          startEpisode={1}
        />
        <FavoriteButton stub={toStub(show)} />
      </TitleHero>

      <FactTiles
        facts={[
          ["Genres", show.genres.join(", ")],
          ["First aired", airDateLabel(show.releaseDate)],
          ["Status", show.status],
          ["Episode runtime", runtime],
          ["Created by", show.creators.join(", ")],
          ["Studios", show.studios.join(", ")],
          ["Languages", show.languages.join(", ")],
        ]}
      />

      {show.seasons.length > 0 && (
        <Section title="Episodes" bleed>
          <Suspense
            fallback={
              <div className="page">
                <EpisodeListSkeleton />
              </div>
            }
          >
            <Episodes tvId={show.tmdbId} seasons={show.seasons} />
          </Suspense>
        </Section>
      )}

      {show.cast.length > 0 && (
        <Section title="Cast" bleed>
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

