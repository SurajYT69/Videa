type Props = {
  title: string;
  eyebrow?: string;
  description?: string;
};

/**
 * Editorial page opener for routes that have no hero. This is where the
 * five-stop wash does its main work: these pages carry no artwork, so the
 * gradient is what makes the top of the page feel like the product.
 */
export function PageHeader({ title, eyebrow, description }: Props) {
  return (
    <header className="relative isolate overflow-hidden border-b border-line">
      <div
        aria-hidden="true"
        className="brand-wash pointer-events-none absolute inset-0 -z-10 opacity-70"
      />

      <div className="page pt-32 pb-14 md:pt-40 md:pb-20">
        {eyebrow && (
          <div className="animate-rise flex items-center gap-3">
            <span className="h-px w-8 bg-fg-3/50" />
            <span className="eyebrow">{eyebrow}</span>
          </div>
        )}
        <h1
          className={`display display-page animate-rise text-fg text-balance ${eyebrow ? "mt-5" : ""}`}
          style={{ animationDelay: "60ms" }}
        >
          {title}
        </h1>
        {description && (
          <p
            className="animate-rise mt-5 max-w-[52ch] text-[15px] leading-relaxed text-fg-2"
            style={{ animationDelay: "120ms" }}
          >
            {description}
          </p>
        )}
      </div>
    </header>
  );
}
