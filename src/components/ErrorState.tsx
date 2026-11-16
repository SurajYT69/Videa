import Link from "next/link";
import type { ReactNode } from "react";

type Props = {
  title: string;
  description: string;
  /** Rendered before the home link. Used for retry buttons. */
  action?: ReactNode;
  /**
   * Inside a page that already has its heading and gutter (a failed result
   * list): no gutter of its own, an h2, and only as tall as it needs.
   * Without it, the error is the page.
   */
  inline?: boolean;
};

/** Raw error text never reaches this component. */
export function ErrorState({ title, description, action, inline = false }: Props) {
  const Heading = inline ? "h2" : "h1";
  return (
    <div
      role={inline ? "alert" : undefined}
      className={
        inline
          ? "border-t border-line py-12 md:py-16"
          : "page flex min-h-[60svh] flex-col items-start justify-center py-24"
      }
    >
      <div className="max-w-md">
        <Heading className={`display text-fg ${inline ? "display-section" : "display-page"}`}>
          {title}
        </Heading>
        <p className="mt-4 text-sm leading-relaxed text-fg-2">{description}</p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          {action}
          <Link
            href="/"
            className="inline-flex h-12 items-center rounded-full border border-line-strong px-5 text-sm font-medium whitespace-nowrap text-fg transition-colors duration-200 hover:border-fg-3 hover:bg-raised"
          >
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
