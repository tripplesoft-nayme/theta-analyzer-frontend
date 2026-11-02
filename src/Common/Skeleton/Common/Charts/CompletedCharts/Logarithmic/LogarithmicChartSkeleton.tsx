const LogarithmicChartSkeleton = () => {
  return (
    <div className="w-full h-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6 flex flex-col space-y-4">
      <div className="flex justify-between items-center">
        <div className="h-6 w-1/3 bg-slate-100 dark:bg-slate-800 animate-pulse rounded" />
        <div className="flex gap-2">
          <div className="h-8 w-8 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-md" />
          <div className="h-8 w-8 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-md" />
        </div>
      </div>
      <div className="flex-1 w-full relative flex items-end space-x-2 pb-8 px-4">
        {/* Y-axis lines */}
        <div className="absolute inset-0 flex flex-col justify-between py-8 px-4 pointer-events-none">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="w-full h-[1px] bg-slate-50 dark:bg-slate-800/50" />
          ))}
        </div>
        
        {/* Bars/Lines representation */}
        <div className="flex-1 h-full flex items-end justify-around space-x-4 relative z-10">
          {[40, 70, 45, 90, 65, 80, 50].map((height, i) => (
            <div key={i} className="flex flex-col items-center space-y-2 w-full">
               <div 
                className="w-full bg-slate-100 dark:bg-slate-800 animate-pulse rounded-t-sm" 
                style={{ height: `${height}%` }}
              />
              <div className="h-3 w-12 bg-slate-50 dark:bg-slate-800/50 animate-pulse rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LogarithmicChartSkeleton;
