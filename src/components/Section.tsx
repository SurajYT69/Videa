import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import type { ReactNode } from "react";

type Props = {
  title: string;
  /** Optional destination for the section's own listing. */
  href?: string;
  hrefLabel?: string;
  /** Rails bleed to the viewport edge; grids stay inside the page gutter. */
  bleed?: boolean;
  children: ReactNode;
};

export function Section({
  title,
  href,
  hrefLabel = "View all",
  bleed = false,
  children,
}: Props) {
  return (
    <section className="py-10 md:py-14">
      <div className="page flex items-end justify-between gap-6">
        <h2 className="display text-xl text-fg md:text-2xl">{title}</h2>
        {href && (
          <Link
            href={href}
            className="group inline-flex shrink-0 items-center gap-1.5 text-sm text-fg-3 transition-colors hover:text-fg"
          >
            {hrefLabel}
            <ArrowRight
              className="size-3.5 transition-transform duration-300 ease-out-expo group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </Link>
        )}
      </div>
      <div className={bleed ? "mt-6" : "page mt-6"}>{children}</div>
    </section>
  );
}
