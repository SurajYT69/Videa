import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import type { ReactNode } from "react";

type Props = {
  title: string;
  /** Short chip after the title, e.g. "Top 10". */
  badge?: string;
  /** One editorial line. Used sparingly; most sections carry none. */
  lead?: string;
  /** Optional destination for the section's own listing. */
  href?: string;
  hrefLabel?: string;
  /** Rails bleed to the viewport edge; grids stay inside the page gutter. */
  bleed?: boolean;
  /** Recessed ground. Alternated so consecutive sections separate visually. */
  tone?: "ground" | "band";
  children: ReactNode;
};

/**
 * A heading with the accent tick, then content. Sections are set apart by
 * rhythm and ground, not by boxing each one in a card.
 */
export function Section({
  title,
  badge,
  lead,
  href,
  hrefLabel = "Show more",
  bleed = false,
  tone = "ground",
  children,
}: Props) {
  return (
    <section className={`py-10 md:py-14 ${tone === "band" ? "band md:-ml-18 md:pl-18" : ""}`}>
      <div className="page flex items-end justify-between gap-8">
        <div className="min-w-0">
          <h2 className="display display-section flex items-center gap-3 text-fg">
            <span aria-hidden="true" className="h-5 w-1 shrink-0 rounded-full bg-accent" />
            {title}
            {badge && (
              <span className="rounded-mini bg-accent px-1.5 py-0.5 font-mono text-[10px] font-semibold tracking-[0.08em] text-ink uppercase">
                {badge}
              </span>
            )}
          </h2>
          {lead && (
            <p className="mt-3 max-w-[46ch] text-sm leading-relaxed text-fg-3">
              {lead}
            </p>
          )}
        </div>

        {href && (
          <Link
            href={href}
            className="group inline-flex shrink-0 items-center gap-1.5 pb-1 text-sm text-fg-3 transition-colors duration-200 hover:text-fg"
          >
            {hrefLabel}
            <ArrowRight
              className="size-3.5 transition-transform duration-300 ease-out-expo group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </Link>
        )}
      </div>

      <div className={bleed ? "mt-6 md:mt-8" : "page mt-6 md:mt-8"}>
        {children}
      </div>
    </section>
  );
}
