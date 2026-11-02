const HorizontalBarChartSkeleton = () => {
  return (
    <div className="h-full w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6 space-y-6">
      <div className="h-6 w-1/3 bg-slate-100 dark:bg-slate-800 animate-pulse rounded" />
      {[70, 85, 60, 95, 50, 80].map((width, i) => (
        <div key={i} className="flex items-center gap-4">
          <div className="h-4 w-16 bg-slate-100 dark:bg-slate-800 animate-pulse rounded" />
          <div className="flex-1 h-8 bg-slate-50 dark:bg-slate-950 rounded overflow-hidden">
            <div
              style={{ width: `${width}%` }}
              className="h-full bg-slate-200 dark:bg-slate-800 animate-pulse rounded-r"
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default HorizontalBarChartSkeleton;
