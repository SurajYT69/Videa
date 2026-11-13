type Props = {
  title: string;
  eyebrow?: string;
  description?: string;
};

/**
 * Editorial page opener for routes that have no hero. No artwork and no wash:
 * the title, on the page ground, is the opener.
 */
export function PageHeader({ title, eyebrow, description }: Props) {
  return (
    <header className="border-b border-line">
      <div className="page pt-32 pb-14 md:pt-40 md:pb-20">
        {eyebrow && (
          <div className="animate-rise flex items-center gap-3">
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
