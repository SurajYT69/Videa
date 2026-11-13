import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Section } from "@/components/Section";
import { MediaGrid } from "@/components/MediaGrid";
import { airDateLabel } from "@/lib/format";
import { PROFILE, tmdbImage } from "@/lib/images";
import { getPerson } from "@/lib/tmdb";

type Props = { params: Promise<{ id: string }> };

function parseId(raw: string): number | null {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const id = parseId((await params).id);
  const person = id ? await getPerson(id).catch(() => null) : null;
  if (!person) return { title: "Person not found" };
  return {
    title: person.name,
    description: person.biography.slice(0, 180) || `Films and series with ${person.name}.`,
  };
}

export default async function PersonPage({ params }: Props) {
  const id = parseId((await params).id);
  if (!id) notFound();

  const person = await getPerson(id);
  if (!person) notFound();

  const photo = tmdbImage(person.profilePath, PROFILE.lg);
  const born = airDateLabel(person.birthday);
  const facts = [
    person.knownFor,
    born && `Born ${born}`,
    person.placeOfBirth,
  ].filter(Boolean) as string[];

  return (
    <>
      <div className="page pt-24 md:pt-20">
        <div className="glass flex flex-col gap-6 rounded-card p-6 sm:flex-row md:gap-8 md:p-8">
          <div className="relative aspect-2/3 w-32 shrink-0 overflow-hidden rounded-card bg-surface md:w-44">
            {photo ? (
              <Image
                src={photo}
                alt={person.name}
                fill
                priority
                sizes="(min-width: 768px) 176px, 128px"
                className="object-cover"
              />
            ) : (
              <span className="absolute inset-0 grid place-items-center font-mono text-3xl text-fg-3">
                {person.name.charAt(0)}
              </span>
            )}
            <span className="pointer-events-none absolute inset-0 rounded-card art-edge" />
          </div>

          <div className="min-w-0">
            <p className="eyebrow">Person</p>
            <h1 className="display display-page mt-3 text-fg">{person.name}</h1>
            {facts.length > 0 && (
              <p className="mt-4 text-sm text-fg-2">{facts.join(" · ")}</p>
            )}
            {person.biography && (
              <p className="mt-4 line-clamp-6 max-w-[72ch] text-[15px] leading-relaxed text-fg-2">
                {person.biography}
              </p>
            )}
          </div>
        </div>
      </div>

      {person.credits.length > 0 && (
        <Section title="Known for">
          <MediaGrid items={person.credits} />
        </Section>
      )}
    </>
  );
}
