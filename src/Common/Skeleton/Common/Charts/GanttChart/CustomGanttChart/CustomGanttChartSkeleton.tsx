import { cn } from "@/lib/utils";

const CustomGanttChartSkeleton = ({ className = "" }: { className?: string }) => {
  return (
    <div className={cn("w-full space-y-6 animate-pulse mt-8", className)}>
      {/* Toolbar Skeleton */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
        <div className="flex gap-2">
          <div className="h-9 w-24 bg-slate-100 dark:bg-slate-800 rounded-md" />
          <div className="h-9 w-24 bg-slate-100 dark:bg-slate-800 rounded-md" />
          <div className="h-9 w-24 bg-slate-100 dark:bg-slate-800 rounded-md" />
        </div>
        <div className="flex gap-2">
          <div className="h-9 w-32 bg-slate-100 dark:bg-slate-800 rounded-md" />
          <div className="h-9 w-32 bg-slate-100 dark:bg-slate-800 rounded-md" />
        </div>
      </div>

      {/* Main Gantt Body Skeleton */}
      <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm flex flex-col min-h-[500px]">
        {/* Header Skeleton */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 h-[60px]">
          <div className="w-[300px] border-r border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-4">
            <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded" />
          </div>
          <div className="flex-1 bg-slate-50 dark:bg-slate-900/50 p-4">
            <div className="h-4 w-full bg-slate-200 dark:bg-slate-800 rounded" />
          </div>
        </div>

        {/* Body Rows Skeleton */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Grid Panel */}
          <div className="w-[300px] border-r border-slate-200 dark:border-slate-800">
            {Array.from({ length: 10 }).map((_, i) => (
              <div 
                key={i} 
                className={cn(
                  "h-[40px] px-4 flex items-center border-b border-slate-100 dark:border-slate-800/50",
                  i % 2 === 0 ? "bg-white dark:bg-slate-900" : "bg-slate-50/50 dark:bg-slate-900/50"
                )}
              >
                <div className="h-3 w-48 bg-slate-100 dark:bg-slate-800 rounded" />
              </div>
            ))}
          </div>
          
          {/* Timeline Panel */}
          <div className="flex-1 relative">
            {Array.from({ length: 10 }).map((_, i) => (
              <div 
                key={i} 
                className={cn(
                  "h-[40px] border-b border-slate-100 dark:border-slate-800/50 relative",
                  i % 2 === 0 ? "bg-white dark:bg-slate-900" : "bg-slate-50/50 dark:bg-slate-900/50"
                )}
              >
                {/* Randomly placed Gantt bars */}
                {i % 3 === 0 && (
                  <div 
                    className="absolute h-6 bg-blue-200/50 dark:bg-blue-500/20 rounded-md"
                    style={{ 
                      left: `${10 + (i * 5)}%`, 
                      width: `${20 + (i * 2)}%`,
                      top: '7px'
                    }} 
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomGanttChartSkeleton;
