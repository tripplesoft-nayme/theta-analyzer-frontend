const BulletChartSkeleton = () => {
  return (
    <div className="h-full w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6 space-y-8">
      <div className="h-6 w-1/3 bg-slate-100 dark:bg-slate-800 animate-pulse rounded" />
      {[1, 2, 3].map((i) => (
        <div key={i} className="space-y-2">
          <div className="h-4 w-1/4 bg-slate-100 dark:bg-slate-800 animate-pulse rounded" />
          <div className="relative h-8 w-full bg-slate-50 dark:bg-slate-950 rounded border border-slate-100 dark:border-slate-900 overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-2/3 bg-slate-200 dark:bg-slate-800 animate-pulse" />
            <div className="absolute left-0 top-2 bottom-2 w-1/2 bg-slate-300 dark:bg-slate-700 animate-pulse z-10" />
            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-red-400 dark:bg-red-900 z-20" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default BulletChartSkeleton;
