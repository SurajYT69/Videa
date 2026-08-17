"use client";

import { ErrorState } from "@/components/ErrorState";

export default function AppError({ reset }: { error: Error; reset: () => void }) {
  return (
    <ErrorState
      title="Something went wrong."
      description="That page didn't load. Trying again usually clears it."
      action={
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center rounded-card bg-fg px-5 py-3 text-sm font-medium whitespace-nowrap text-ink transition duration-200 hover:-translate-y-px hover:shadow-lift active:translate-y-0 active:shadow-soft"
        >
          Try again
        </button>
      }
    />
  );
}
