import Link from "next/link";
import type { ReactNode } from "react";

type Props = {
  title: string;
  description: string;
  action?: { href: string; label: string };
  children?: ReactNode;
};

/**
 * An empty section is an absence, so the frame stays a hairline on the resting
 * surface rather than a filled card: enough shape to read as designed, not
 * enough to look like content that failed to load.
 */
export function EmptyState({ title, description, action, children }: Props) {
  return (
    <div className="rounded-card border border-line bg-surface/60 px-6 py-12 md:px-12 md:py-16">
      <div className="max-w-md">
        <span
          aria-hidden="true"
          className="block h-px w-10 bg-line-strong"
        />
        <h3 className="display mt-6 text-xl text-fg md:text-2xl">{title}</h3>
        <p className="mt-3 text-sm leading-relaxed text-fg-2">{description}</p>
        {action && (
          <Link
            href={action.href}
            className="mt-7 inline-flex items-center rounded-card border border-line-strong bg-raised px-5 py-3 text-sm font-medium whitespace-nowrap text-fg transition duration-200 hover:border-fg-3 hover:-translate-y-px hover:shadow-soft active:translate-y-0"
          >
            {action.label}
          </Link>
        )}
        {children}
      </div>
    </div>
  );
}
