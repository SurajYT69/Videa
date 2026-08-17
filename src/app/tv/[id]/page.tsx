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
import { BACKDROP, tmdbImage } from "@/lib/images";
import { runtimeLabel, year } from "@/lib/format";
import { toStub } from "@/lib/stub";
import { getSeason, getSimilar, getTV } from "@/lib/tmdb";

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

export default async function TVDetailsPage({ params }: Props) {
  const { id } = await params;
  const parsed = parseId(id);
  if (!parsed) notFound();

  const show = await getTV(parsed);
  if (!show) notFound();

  const firstSeason = show.seasons[0]?.seasonNumber ?? 1;

  /* Only the first season is fetched up front. The rest load on demand. */
  const [initialSeason, similar] = await Promise.all([
    getSeason(parsed, firstSeason).catch(() => null),
    getSimilar("tv", parsed).catch(() => []),
  ]);

  const started = year(show.releaseDate);
  const seasonCount = show.seasons.length;

  return (
    <>
      <ViewRecorder stub={toStub(show)} />
      <DetailBackdrop path={show.backdropPath} />

      <div className="page -mt-28 md:-mt-40">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-12 md:gap-10">
          <div className="hidden md:col-span-3 md:block lg:col-span-3 xl:col-span-2">
            <div className="relative aspect-2/3 overflow-hidden rounded-card bg-surface shadow-lift">
              <Poster
                path={show.posterPath}
                title={show.title}
                sizes="(min-width: 1280px) 200px, 260px"
                size="lg"
                priority
              />
              <div className="pointer-events-none absolute inset-0 rounded-card art-edge" />
            </div>
          </div>

          <div className="md:col-span-9 md:pt-16 lg:col-span-8">
            <h1 className="display text-4xl text-fg text-balance md:text-5xl lg:text-6xl">
              {show.title}
            </h1>

            <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
              <Rating value={show.rating} />
              {started && <span className="meta">{started}</span>}
              {seasonCount > 0 && (
                <span className="meta">
                  {seasonCount} Season{seasonCount === 1 ? "" : "s"}
                </span>
              )}
              {runtimeLabel(show.episodeRunTime) && (
                <span className="meta">
                  {runtimeLabel(show.episodeRunTime)} per episode
                </span>
              )}
              {show.status && <span className="meta">{show.status}</span>}
            </div>

            {show.genres.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2">
                {show.genres.map((genre) => (
                  <GenreBadge key={genre} label={genre} />
                ))}
              </div>
            )}

            {show.overview && (
              <p className="mt-7 max-w-[62ch] text-sm leading-relaxed text-fg-2 md:text-base">
                {show.overview}
              </p>
            )}

            {show.creators.length > 0 && (
              <p className="meta mt-5">
                Created by <span className="text-fg-2">{show.creators.join(", ")}</span>
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
        <Section title="Episodes">
          <SeasonSelector
            tvId={show.tmdbId}
            seasons={show.seasons}
            initialSeason={initialSeason}
          />
        </Section>
      )}

      {show.cast.length > 0 && (
        <Section title="Cast" bleed>
          <CastRail cast={show.cast} />
        </Section>
      )}

      {similar.length > 0 && (
        <Section title="More like this">
          <MediaGrid items={similar.slice(0, 12)} />
        </Section>
      )}
    </>
  );
}
