import Link from "next/link";
import type { ReactNode } from "react";

type Props = {
  title: string;
  description: string;
  /** The way forward. Primary, because on an empty screen it is the only thing to do. */
  action?: { href: string; label: string };
  /** A quieter second way forward, set as a text link beside the first. */
  secondary?: { href: string; label: string };
  children?: ReactNode;
};

/**
 * An empty section is an absence, so it gets no box: a hairline above, the
 * sentence that says what will appear here, and the way to make it appear.
 * A filled card read as content that had failed to load.
 */
export function EmptyState({ title, description, action, secondary, children }: Props) {
  return (
    <div className="border-t border-line pt-8 md:pt-10">
      <div className="max-w-md">
        <h3 className="display text-xl text-fg md:text-2xl">{title}</h3>
        <p className="mt-3 text-sm leading-relaxed text-fg-2">{description}</p>
        {(action || secondary) && (
          <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3">
            {action && (
              <Link
                href={action.href}
                className="inline-flex h-12 items-center rounded-full bg-fg px-6 text-sm font-medium whitespace-nowrap text-ink transition duration-200 hover:-translate-y-px hover:shadow-lift active:translate-y-0"
              >
                {action.label}
              </Link>
            )}
            {secondary && (
              <Link
                href={secondary.href}
                className="text-sm whitespace-nowrap text-fg-2 underline decoration-line-strong underline-offset-4 transition-colors duration-200 hover:text-fg hover:decoration-fg-3"
              >
                {secondary.label}
              </Link>
            )}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
