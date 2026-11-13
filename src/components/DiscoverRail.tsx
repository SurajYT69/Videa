import { Suspense } from "react";
import { Section } from "./Section";
import { PosterRail } from "./PosterRail";
import { PosterRailSkeleton, SectionSkeleton } from "./LoadingSkeleton";
import { discover, type DiscoverParams } from "@/lib/tmdb";
import type { MediaType } from "@/lib/types";

type Props = {
  title: string;
  type: MediaType;
  params: DiscoverParams;
  tone?: "ground" | "band";
  href?: string;
};

/*
 * One poster rail fed by TMDB discover. A failed or empty request renders
 * nothing: these rails are extra discovery, so a gap is better than an error
 * box in the middle of a page.
 */
async function Rows({ title, type, params, tone, href }: Props) {
  const { items } = await discover(type, params).catch(() => ({ items: [] }));
  if (!items.length) return null;

  return (
    <Section title={title} tone={tone} href={href} bleed>
      <PosterRail items={items.slice(0, 18)} label={title} />
    </Section>
  );
}

/** Streams on its own, so each rail costs the page nothing while it loads. */
export function DiscoverRail(props: Props) {
  return (
    <Suspense
      fallback={
        <SectionSkeleton bleed>
          <PosterRailSkeleton />
        </SectionSkeleton>
      }
    >
      <Rows {...props} />
    </Suspense>
  );
}
