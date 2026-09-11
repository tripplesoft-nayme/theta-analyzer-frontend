/**
 * lazyWithRetry
 *
 * Wraps lazyWithRetry() with a "reload once on chunk-load failure" strategy.
 *
 * WHY: After a Vercel deployment, old hashed JS chunks are deleted. Any user who
 * still has the old app in memory and navigates to a lazy-loaded route will get
 * "Failed to fetch dynamically imported module". This util detects that specific
 * failure and forces a hard page reload (once, to avoid reload loops) so the
 * browser fetches the fresh index.html and new chunks automatically.
 *
 * Usage:  replace `lazy(() => import("..."))` with `lazyWithRetry(() => import("..."))`
 */

import { lazy } from "react";

const CHUNK_RELOAD_KEY = "chunk_reload_attempted";

export function lazyWithRetry<T extends React.ComponentType<any>>(
  factory: () => Promise<{ default: T }>
): React.LazyExoticComponent<T> {
  return lazy(() =>
    factory().catch((error: Error) => {
      const isChunkError =
        error?.name === "ChunkLoadError" ||
        error?.message?.includes("Failed to fetch dynamically imported module") ||
        error?.message?.includes("Importing a module script failed") ||
        error?.message?.includes("error loading dynamically imported module");

      if (!isChunkError) {
        // Not a chunk error — rethrow so other error boundaries handle it
        throw error;
      }

      const alreadyRetried = sessionStorage.getItem(CHUNK_RELOAD_KEY) === "true";

      if (alreadyRetried) {
        // Second failure after reload — clear flag and rethrow to show error UI
        sessionStorage.removeItem(CHUNK_RELOAD_KEY);
        throw error;
      }

      // Mark that we've attempted a reload, then hard-reload the page
      sessionStorage.setItem(CHUNK_RELOAD_KEY, "true");
      window.location.reload();

      // Return a never-resolving promise since we're reloading anyway
      return new Promise(() => {});
    })
  );
}
