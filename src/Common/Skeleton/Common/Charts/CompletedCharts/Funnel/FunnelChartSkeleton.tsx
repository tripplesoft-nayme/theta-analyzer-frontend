const FunnelChartSkeleton = () => {
  return (
    <div className="h-full w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6">
      <div className="h-6 w-1/3 bg-slate-100 dark:bg-slate-800 animate-pulse rounded mb-8" />
      <div className="flex flex-col items-center justify-center space-y-2 pt-8">
        {[100, 80, 60, 40].map((width, i) => (
          <div
            key={i}
            style={{ width: `${width}%` }}
            className="h-12 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-sm"
          />
        ))}
      </div>
    </div>
  );
};

export default FunnelChartSkeleton;
