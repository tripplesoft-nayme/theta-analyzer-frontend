import { Maximize2, Minimize2 } from "lucide-react";

export const FullscreenToggle = ({
  isFullscreen,
  toggleFullscreen,
}: {
  isFullscreen: boolean;
  toggleFullscreen: () => void;
}) => {
  return (
    <button
      onClick={toggleFullscreen}
      className="fixed bottom-6 right-6 z-50 flex size-12 items-center justify-center rounded-full bg-white dark:bg-slate-900 border border-border dark:border-slate-800 text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800 transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-1 focus:ring-blue-500 active:scale-95 cursor-pointer group"
      title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Focus"}
    >
      {isFullscreen ? (
        <Minimize2 className="h-6 w-6 text-blue-600 dark:text-blue-400 group-hover:rotate-12 transition-transform duration-300" />
      ) : (
        <Maximize2 className="h-6 w-6 text-gray-600 dark:text-slate-300 group-hover:scale-110 transition-transform duration-300" />
      )}
    </button>
  );
};
