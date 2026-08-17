type Props = {
  title: string;
  description?: string;
};

/**
 * Editorial page opener for routes that have no hero. This is where the
 * five-stop wash does its main work: these pages carry no artwork, so the
 * gradient is what makes the top of the page feel like the product.
 */
export function PageHeader({ title, description }: Props) {
  return (
    <header className="relative isolate overflow-hidden border-b border-line">
      <div
        aria-hidden="true"
        className="brand-wash pointer-events-none absolute inset-0 -z-10 opacity-70"
      />

      <div className="page pt-28 pb-12 md:pt-36 md:pb-16">
        <h1 className="display animate-rise text-4xl text-fg text-balance md:text-6xl">
          {title}
        </h1>
        {description && (
          <p
            className="animate-rise mt-4 max-w-lg text-sm leading-relaxed text-fg-2"
            style={{ animationDelay: "80ms" }}
          >
            {description}
          </p>
        )}
      </div>
    </header>
  );
}
