export function GenreBadge({ label }: { label: string }) {
  return (
    <span className="rounded-card border border-line-strong px-2.5 py-1 text-xs text-fg-2">
      {label}
    </span>
  );
}
