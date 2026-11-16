import { Star } from "@phosphor-icons/react/dist/ssr";
import { ratingLabel } from "@/lib/format";

type Props = { value: number };

/** The accent's primary job on this site: marking quality. */
export function Rating({ value }: Props) {
  const label = ratingLabel(value);
  if (!label) return null;

  return (
    <span
      className="inline-flex items-center gap-1 font-mono text-accent"
      title={`Rated ${label} out of 10 on TMDB`}
    >
      <Star weight="fill" className="size-3 shrink-0" aria-hidden="true" />
      <span className="tabular-nums">{label}</span>
      <span className="sr-only">out of 10</span>
    </span>
  );
}
/** Score as a ring: the arc is the rating out of ten. Sits on artwork. */
export function Score({ value }: { value: number }) {
  const label = ratingLabel(value);
  if (!label) return null;

  const radius = 16;
  const circumference = 2 * Math.PI * radius;

  return (
    <span
      className="relative grid size-10 shrink-0 place-items-center"
      title={`Rated ${label} out of 10 on TMDB`}
    >
      <svg viewBox="0 0 40 40" className="absolute inset-0 -rotate-90" aria-hidden="true">
        <circle cx="20" cy="20" r={radius} fill="none" stroke="currentColor" strokeWidth="3" className="text-fg/20" />
        <circle
          cx="20"
          cy="20"
          r={radius}
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={`${(value / 10) * circumference} ${circumference}`}
        />
      </svg>
      <span className="font-mono text-xs font-medium text-fg tabular-nums">{label}</span>
      <span className="sr-only">out of 10</span>
    </span>
  );
}
