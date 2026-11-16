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
      /* Icon-only on phones so the actions fit two rows; same 52px as Save. */
      className="glass inline-flex size-[52px] items-center justify-center gap-2 rounded-full text-[15px] font-medium whitespace-nowrap text-fg transition duration-200 hover:bg-fg/10 active:translate-y-px sm:size-auto sm:px-6 sm:py-4 sm:text-base"
    >
      <Icon className="size-4" aria-hidden="true" />
      <span aria-live="polite" className="sr-only sm:not-sr-only">
        {copied ? "Copied" : "Share"}
      </span>
    </button>
  );
}
