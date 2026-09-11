import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const ApexDonutChartSkeleton = () => {
  return (
    <Card className="w-full border-[#E2E8F0] shadow-none">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 mb-7">
        {/* Title Skeleton */}
        <Skeleton className="h-6 w-32" />
        {/* Dropdown Skeleton */}
        <Skeleton className="h-9 w-24 rounded-md" />
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Legend Grid Skeleton */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center space-x-2">
              <Skeleton className="w-3 h-3 rounded-full" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-8 ml-auto" />
            </div>
            <div className="flex items-center space-x-2">
              <Skeleton className="w-3 h-3 rounded-full" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-8 ml-auto" />
            </div>
            <div className="flex items-center space-x-2">
              <Skeleton className="w-3 h-3 rounded-full" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-8 ml-auto" />
            </div>
            <div className="flex items-center space-x-2">
              <Skeleton className="w-3 h-3 rounded-full" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-8 ml-auto" />
            </div>
          </div>

          {/* Chart Donut Skeleton */}
          <div className="relative w-full h-[280px] flex items-center justify-center">
            {/* Donut Shape loading animation using relative borders/pulse */}
            <div className="w-[200px] h-[200px] rounded-full border-[25px] border-slate-100 dark:border-slate-800 animate-pulse flex items-center justify-center">
              {/* Inner Center Label Skeleton */}
              <div className="flex flex-col items-center justify-center space-y-1">
                <Skeleton className="h-8 w-12" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ApexDonutChartSkeleton;
