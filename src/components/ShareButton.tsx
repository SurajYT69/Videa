"use client";

import { useEffect, useState } from "react";
import { Check, ShareNetwork } from "@phosphor-icons/react";

/**
 * Shares the title page. The system share sheet where there is one (phones,
 * which is where WhatsApp and Instagram live), else the URL goes to the
 * clipboard and the label says so for two seconds. The preview those apps
 * draw is the page's `opengraph-image`.
 */
export function ShareButton({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  const share = async () => {
    const url = location.origin + location.pathname;
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        /* Dismissed sheet. Nothing to do. */
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      /* Clipboard blocked; nothing honest to show. */
    }
  };

  const Icon = copied ? Check : ShareNetwork;

  return (
    <button
      type="button"
      onClick={share}
      className="glass inline-flex items-center gap-2 rounded-full px-6 py-4 text-base font-medium whitespace-nowrap text-fg transition duration-200 hover:bg-fg/10 active:translate-y-px"
    >
      <Icon className="size-4" aria-hidden="true" />
      <span aria-live="polite">{copied ? "Copied" : "Share"}</span>
    </button>
  );
}
