/**
 * RouteErrorElement
 *
 * Used as the `errorElement` prop on React Router routes.
 * This catches errors that React Router intercepts internally — including
 * "Failed to fetch dynamically imported module" errors from lazy-loaded chunks —
 * BEFORE they reach a class-based ErrorBoundary in the tree.
 *
 * Behaviour:
 * - Chunk-load error → auto-reload once (using sessionStorage guard), then show
 *   a "New version available" UI if reload didn't fix it.
 * - Any other error → show a generic error UI.
 */

import { useRouteError, isRouteErrorResponse, useNavigate } from "react-router-dom";

const CHUNK_RELOAD_KEY = "chunk_reload_attempted";

function isChunkError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  return (
    error.name === "ChunkLoadError" ||
    error.message.includes("Failed to fetch dynamically imported module") ||
    error.message.includes("Importing a module script failed") ||
    error.message.includes("error loading dynamically imported module")
  );
}

export default function RouteErrorElement() {
  const error = useRouteError();
  const navigate = useNavigate();

  // Attempt auto-reload for chunk errors (only once per session)
  if (isChunkError(error)) {
    const alreadyRetried = sessionStorage.getItem(CHUNK_RELOAD_KEY) === "true";
    if (!alreadyRetried) {
      sessionStorage.setItem(CHUNK_RELOAD_KEY, "true");
      window.location.reload();
      // Render nothing while the page reloads
      return null;
    }
    // Second visit after reload — show the manual reload UI
    sessionStorage.removeItem(CHUNK_RELOAD_KEY);
    return <ChunkErrorUI />;
  }

  // 404 / route-level errors from React Router
  if (isRouteErrorResponse(error)) {
    return (
      <GenericErrorUI
        title={`${error.status} — ${error.statusText}`}
        message={error.data?.message ?? "This page could not be found."}
        onGoBack={() => navigate(-1)}
      />
    );
  }

  // Unknown error
  const message =
    error instanceof Error ? error.message : "An unexpected error occurred.";
  return <GenericErrorUI title="Something went wrong" message={message} onGoBack={() => navigate(-1)} />;
}

/* ── Sub-components ─────────────────────────────────────────────────────── */

function ChunkErrorUI() {
  const handleReload = () => {
    sessionStorage.removeItem(CHUNK_RELOAD_KEY);
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-slate-950 px-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center mb-6">
        <svg className="w-8 h-8 text-blue-500 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </div>
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
        New version available
      </h2>
      <p className="text-sm text-gray-500 dark:text-slate-400 max-w-sm mb-6">
        The app was updated while you were browsing. Please reload to get the latest version.
      </p>
      <button
        onClick={handleReload}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all text-white text-sm font-semibold shadow-lg shadow-blue-500/25"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        Reload App
      </button>
    </div>
  );
}

function GenericErrorUI({
  title,
  message,
  onGoBack,
}: {
  title: string;
  message: string;
  onGoBack: () => void;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-slate-950 px-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-rose-500/10 flex items-center justify-center mb-6">
        <svg className="w-8 h-8 text-red-500 dark:text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        </svg>
      </div>
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{title}</h2>
      <p className="text-sm text-gray-500 dark:text-slate-400 max-w-sm mb-6">{message}</p>
      <div className="flex gap-3">
        <button
          onClick={onGoBack}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 active:scale-95 transition-all text-gray-700 dark:text-slate-200 text-sm font-semibold"
        >
          Go Back
        </button>
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-900 hover:bg-gray-800 dark:bg-slate-700 dark:hover:bg-slate-600 active:scale-95 transition-all text-white text-sm font-semibold"
        >
          Reload Page
        </button>
      </div>
    </div>
  );
}
