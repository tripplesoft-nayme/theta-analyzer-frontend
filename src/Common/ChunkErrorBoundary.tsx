import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  isChunkError: boolean;
}

/**
 * ChunkErrorBoundary
 *
 * Catches "Failed to fetch dynamically imported module" errors that can occur
 * when a new Vercel deployment is made while a user still has the old app open.
 *
 * Behaviour:
 * - If the error is a chunk-load error → shows a friendly "New version available"
 *   banner with a manual reload button (lazyWithRetry handles the automatic reload,
 *   this is the last-resort UI fallback).
 * - Any other error → rethrows (or shows a generic error UI).
 */
export class ChunkErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, isChunkError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    const isChunkError =
      error?.name === "ChunkLoadError" ||
      error?.message?.includes("Failed to fetch dynamically imported module") ||
      error?.message?.includes("Importing a module script failed") ||
      error?.message?.includes("error loading dynamically imported module");

    return { hasError: true, isChunkError };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[ChunkErrorBoundary] Caught error:", error, info);
  }

  handleReload = () => {
    sessionStorage.removeItem("chunk_reload_attempted");
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    if (this.state.isChunkError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-slate-950 px-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center mb-6">
            <svg
              className="w-8 h-8 text-blue-500 dark:text-blue-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            New version available
          </h2>
          <p className="text-sm text-gray-500 dark:text-slate-400 max-w-sm mb-6">
            The application was updated while you were browsing. Please reload
            to get the latest version.
          </p>
          <button
            onClick={this.handleReload}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all text-white text-sm font-semibold shadow-lg shadow-blue-500/25"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Reload App
          </button>
        </div>
      );
    }

    // Generic error fallback (non-chunk)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-slate-950 px-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-rose-500/10 flex items-center justify-center mb-6">
          <svg
            className="w-8 h-8 text-red-500 dark:text-rose-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
            />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          Something went wrong
        </h2>
        <p className="text-sm text-gray-500 dark:text-slate-400 max-w-sm mb-6">
          An unexpected error occurred. Try reloading the page.
        </p>
        <button
          onClick={this.handleReload}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-900 hover:bg-gray-800 active:scale-95 transition-all dark:bg-slate-700 dark:hover:bg-slate-600 text-white text-sm font-semibold"
        >
          Reload Page
        </button>
      </div>
    );
  }
}
