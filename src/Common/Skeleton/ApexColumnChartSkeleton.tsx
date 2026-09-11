import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const ApexColumnChartSkeleton = () => {
  return (
    <Card className="w-full h-full bg-white dark:bg-slate-900 p-6 shadow-sm border border-gray-200 dark:border-slate-800">
      <div className="flex items-center justify-between mb-4">
        {/* Title Skeleton */}
        <Skeleton className="h-6 w-48" />
        <Skeleton className="w-9 h-9 rounded-md" />
      </div>

      {/* Legend Skeleton */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Skeleton className="w-2.5 h-2.5 rounded-full" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="w-2.5 h-2.5 rounded-full" />
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="w-2.5 h-2.5 rounded-full" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>

      {/* Chart Columns Skeleton */}
      <div className="h-[280px] flex items-end justify-between px-2 pt-4">
        <Skeleton className="w-[8%] h-[40%]" />
        <Skeleton className="w-[8%] h-[65%]" />
        <Skeleton className="w-[8%] h-[60%]" />
        <Skeleton className="w-[8%] h-[85%]" />
        <Skeleton className="w-[8%] h-[70%]" />
        <Skeleton className="w-[8%] h-[80%]" />
        <Skeleton className="w-[8%] h-[95%]" />
        <Skeleton className="w-[8%] h-[82%]" />
        <Skeleton className="w-[8%] h-[55%]" />
        <Skeleton className="w-[8%] h-[75%]" />
      </div>
    </Card>
  );
};

export default ApexColumnChartSkeleton;
