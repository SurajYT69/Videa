"use client";

import { useSyncExternalStore } from "react";
import { getServerSnapshot, getSnapshot, subscribe } from "./storage";
import type { LocalState } from "./types";

/**
 * Reads the persisted library. Renders empty on the server and during
 * hydration, then fills in, so markup never mismatches.
 */
export function useLibrary(): LocalState {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
