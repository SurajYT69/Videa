import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import type { ReactNode } from "react";

type Props = {
  title: string;
  /** Category marker above the title. What makes one section read unlike the next. */
  eyebrow?: string;
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
 * The rule above the heading is the section's own edge. Sections are set
 * apart by rhythm and ground, not by boxing each one in a card.
 */
export function Section({
  title,
  eyebrow,
  lead,
  href,
  hrefLabel = "View all",
  bleed = false,
  tone = "ground",
  children,
}: Props) {
  return (
    <section
      className={`py-14 md:py-20 ${tone === "band" ? "band" : ""}`}
    >
      <div className="page">
        <div className="h-px w-full bg-line" />

        <div className="mt-6 flex items-end justify-between gap-8 md:mt-8">
          <div className="min-w-0">
            {eyebrow && <p className="eyebrow">{eyebrow}</p>}
            <h2
              className={`display display-section text-fg ${eyebrow ? "mt-2.5" : ""}`}
            >
              {title}
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
      </div>

      <div className={bleed ? "mt-8 md:mt-10" : "page mt-8 md:mt-10"}>
        {children}
      </div>
    </section>
  );
}
