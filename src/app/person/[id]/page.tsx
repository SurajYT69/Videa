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
    born && `Born ${born}`,
    person.placeOfBirth,
  ].filter(Boolean) as string[];

  return (
    <>
      {/* No box: the portrait and the name carry the opener, the same way a
          title page opens on its artwork rather than on a panel. */}
      <div className="page pt-24 md:pt-20">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end md:gap-10">
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
            <p className="eyebrow">{person.knownFor ?? "Person"}</p>
            <h1 className="display display-page mt-3 text-balance text-fg">{person.name}</h1>
            {facts.length > 0 && (
              <p className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-fg-2">
                {facts.map((fact, index) => (
                  <span key={fact} className="flex items-center gap-3">
                    {index > 0 && <span aria-hidden="true" className="size-1 rounded-full bg-fg-3/60" />}
                    {fact}
                  </span>
                ))}
              </p>
            )}
          </div>
        </div>

        {person.biography && (
          <p className="mt-8 line-clamp-6 max-w-[68ch] text-[15px] leading-relaxed text-pretty text-fg-2 md:text-base">
            {person.biography}
          </p>
        )}
      </div>

      {person.credits.length > 0 && (
        <Section title="Known for">
          <MediaGrid items={person.credits} />
        </Section>
      )}
    </>
  );
}
