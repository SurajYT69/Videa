import Link from "next/link";
import type { ReactNode } from "react";

type Props = {
  title: string;
  description: string;
  /** Rendered next to the home link. Used for retry buttons. */
  action?: ReactNode;
};

/** Raw error text never reaches this component. */
export function ErrorState({ title, description, action }: Props) {
  return (
    <div className="page flex min-h-[60dvh] flex-col items-start justify-center py-24 md:items-center md:text-center">
      <h1 className="display text-3xl text-fg md:text-4xl">{title}</h1>
      <p className="mt-4 max-w-md text-sm leading-relaxed text-fg-2">
        {description}
      </p>
      <div className="mt-8 flex flex-wrap items-center gap-3">
        {action}
        <Link
          href="/"
          className="inline-flex items-center rounded-card border border-line-strong px-5 py-3 text-sm font-medium whitespace-nowrap text-fg transition duration-200 hover:border-fg-3 hover:bg-raised active:translate-y-px"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
