"use client";

import { useEffect } from "react";
import { recordView } from "@/lib/storage";
import type { MediaStub } from "@/lib/types";

/** Records a details-page visit into recently viewed. Renders nothing. */
export function ViewRecorder({ stub }: { stub: MediaStub }) {
  useEffect(() => {
    recordView(stub);
    // Re-running only when the title changes keeps the timestamp meaningful.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stub.type, stub.tmdbId]);

  return null;
}
