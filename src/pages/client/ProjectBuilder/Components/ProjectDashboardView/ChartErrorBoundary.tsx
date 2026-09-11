import { Component, ReactNode } from "react";

export class ChartErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; retryCount: number; isRetrying: boolean }
> {
  private timer: any = null;

  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, retryCount: 0, isRetrying: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("Chart Error caught:", error, errorInfo);
    
    if (this.state.retryCount < 2) {
      this.setState({ isRetrying: true });
      this.timer = setTimeout(() => {
        this.setState((prevState) => ({
          hasError: false,
          isRetrying: false,
          retryCount: prevState.retryCount + 1,
        }));
      }, 800); // 800ms delay to allow data sync or chunk load
    }
  }

  componentDidUpdate() {
    if (!this.state.hasError && this.state.retryCount > 0) {
      this.setState({ retryCount: 0 });
    }
  }

  componentWillUnmount() {
    if (this.timer) {
      clearTimeout(this.timer);
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.state.isRetrying) {
        return (
          <div className="h-full min-h-[250px] w-full flex flex-col items-center justify-center bg-gray-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-gray-200 dark:border-slate-800 animate-pulse p-6">
            <span className="text-gray-400 dark:text-slate-500 text-sm font-medium">
              Loading Chart Data...
            </span>
          </div>
        );
      }

      return (
        <div className="h-full w-full flex flex-col items-center justify-center bg-red-50 dark:bg-rose-500/10 rounded-xl border border-dashed border-red-200 dark:border-rose-500/20 p-6 text-center">
          <div className="w-10 h-10 bg-red-100 dark:bg-rose-500/20 rounded-full flex items-center justify-center text-red-600 dark:text-rose-400 mb-3 font-bold">
            !
          </div>
          <h3 className="text-sm font-bold text-red-800 dark:text-rose-300 mb-1">
            Component Error
          </h3>
          <p className="text-xs text-red-600 dark:text-rose-400/80 max-w-[200px]">
            Something went wrong while rendering this widget.
          </p>
          <button
            onClick={() => this.setState({ hasError: false, retryCount: 0 })}
            className="mt-4 text-[10px] font-bold uppercase tracking-wider text-red-700 dark:text-rose-400 hover:text-red-800 dark:hover:text-rose-300 underline"
          >
            Try Recovery
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
