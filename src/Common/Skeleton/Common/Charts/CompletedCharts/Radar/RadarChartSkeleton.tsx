const RadarChartSkeleton = () => {
  return (
    <div className="h-full w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6">
      <div className="h-6 w-1/3 bg-slate-100 dark:bg-slate-800 animate-pulse rounded mb-8" />
      <div className="flex flex-col items-center justify-center">
        <div className="relative w-48 h-48 bg-slate-50 dark:bg-slate-950 rounded-full flex items-center justify-center">
          <div className="absolute inset-4 border border-dashed border-slate-200 dark:border-slate-800 rounded-full" />
          <div className="absolute inset-12 border border-dashed border-slate-200 dark:border-slate-800 rounded-full" />
          <div className="absolute inset-20 border border-dashed border-slate-200 dark:border-slate-800 rounded-full" />
          <svg className="w-full h-full animate-pulse" viewBox="0 0 100 100">
            <polygon
              points="50,10 90,40 75,90 25,90 10,40"
              className="fill-slate-100/50 stroke-slate-200 dark:fill-slate-800/50 dark:stroke-slate-700"
              strokeWidth="0.5"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default RadarChartSkeleton;
