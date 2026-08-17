import Link from "next/link";
import type { ReactNode } from "react";

type Props = {
  title: string;
  description: string;
  action?: { href: string; label: string };
  children?: ReactNode;
};

/**
 * No container. An empty section is already an absence; boxing it just adds a
 * second empty thing to look at.
 */
export function EmptyState({ title, description, action, children }: Props) {
  return (
    <div className="max-w-md py-6">
      <h3 className="display text-lg text-fg md:text-xl">{title}</h3>
      <p className="mt-2.5 text-sm leading-relaxed text-fg-2">{description}</p>
      {action && (
        <Link
          href={action.href}
          className="mt-6 inline-flex items-center rounded-card border border-line-strong px-5 py-2.5 text-sm font-medium whitespace-nowrap text-fg transition duration-200 hover:border-fg-3 hover:bg-raised active:translate-y-px"
        >
          {action.label}
        </Link>
      )}
      {children}
    </div>
  );
}
