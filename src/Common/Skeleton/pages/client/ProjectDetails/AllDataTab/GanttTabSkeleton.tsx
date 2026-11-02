const GanttTabSkeleton = () => {
  return (
    <div className="p-6 bg-white dark:bg-slate-900 rounded-lg animate-pulse">
      <div className="h-8 w-64 bg-gray-200 dark:bg-slate-700 rounded mb-6"></div>
      <div className="flex gap-4 mb-6">
        <div className="w-64 flex-shrink-0 border-r border-border dark:border-slate-800 pr-4">
          <div className="h-8 bg-gray-100 dark:bg-slate-800 rounded mb-4"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-10 bg-gray-100 dark:bg-slate-800 rounded mb-2"></div>
          ))}
        </div>
        <div className="flex-1">
          <div className="h-8 bg-gray-100 dark:bg-slate-800 rounded mb-4"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="relative h-10 border-b border-border dark:border-slate-800 mb-2">
              <div
                className="absolute h-6 bg-gray-200 dark:bg-slate-700 rounded-sm"
                style={{
                  left: `${(i * 15) % 40 + 10}%`,
                  width: `${30 + (i * 5) % 40}%`,
                  top: "8px"
                }}
              ></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
export default GanttTabSkeleton;
