export const DragDropPlaceholder = ({ isDragOverCanvas }: { isDragOverCanvas: boolean }) => {
  if (!isDragOverCanvas) return null;

  return (
    <div
      className="animate-pulse"
      style={{
        gridColumn: "1 / -1",
        animation: "fadeSlideIn 0.18s ease-in",
      }}
    >
      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <div className="w-full h-[280px] rounded-xl border-2 border-dashed border-blue-300 dark:border-blue-500/30 bg-blue-50/40 dark:bg-blue-500/5 flex flex-col items-center justify-center gap-4 shadow-inner">
        <div className="w-full px-6 space-y-3">
          <div className="flex justify-between items-center">
            <div className="h-5 w-40 bg-blue-100 dark:bg-blue-500/10 rounded-lg" />
            <div className="flex gap-2">
              <div className="h-4 w-16 bg-blue-100 dark:bg-blue-500/10 rounded" />
              <div className="h-4 w-16 bg-blue-100 dark:bg-blue-500/10 rounded" />
            </div>
          </div>
          <div className="flex items-end gap-2 pt-4 pb-2">
            {[55, 38, 70, 45, 80, 30, 60, 50, 75, 42].map((h, i) => (
              <div
                key={i}
                className="flex-1 bg-blue-100 dark:bg-blue-500/20 rounded-t"
                style={{ height: `${h}px` }}
              />
            ))}
          </div>
          <div className="h-px w-full bg-blue-100 dark:bg-blue-500/10" />
        </div>
        <div className="flex items-center gap-2 text-blue-400 dark:text-blue-500">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4v16m8-8H4"
            />
          </svg>
          <span className="text-sm font-semibold tracking-wide">
            Release to add widget
          </span>
        </div>
      </div>
    </div>
  );
};
