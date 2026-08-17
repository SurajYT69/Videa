import { Star } from "@phosphor-icons/react/dist/ssr";
import { ratingLabel } from "@/lib/format";

type Props = {
  value: number;
  /** `bare` drops the star for dense metadata lines. */
  variant?: "star" | "bare";
};

/** The accent's primary job on this site: marking quality. */
export function Rating({ value, variant = "star" }: Props) {
  const label = ratingLabel(value);
  if (!label) return null;

  return (
    <span
      className="inline-flex items-center gap-1 font-mono text-accent"
      title={`Rated ${label} out of 10 on TMDB`}
    >
      {variant === "star" && (
        <Star weight="fill" className="size-3 shrink-0" aria-hidden="true" />
      )}
      <span className="tabular-nums">{label}</span>
      <span className="sr-only">out of 10</span>
    </span>
  );
}
