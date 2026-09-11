import BoxContainer from "@/Common/BoxContainer";
import { Skeleton } from "@/components/ui/skeleton";

const ApexBarChartSkeleton = () => {
  return (
    <BoxContainer>
      {/* Title Skeleton */}
      <Skeleton className="h-8 w-64 mb-4" />

      {/* Legend Skeleton */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Skeleton className="w-2.5 h-2.5 rounded-full" />
          <Skeleton className="h-4 w-8" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="w-2.5 h-2.5 rounded-full" />
          <Skeleton className="h-4 w-12" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="w-2.5 h-2.5 rounded-full" />
          <Skeleton className="h-4 w-12" />
        </div>
      </div>

      {/* Chart Bars Skeletons */}
      <div className="space-y-4 py-2">
        <div className="flex items-center gap-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-6 flex-1 max-w-[80%]" />
        </div>
        <div className="flex items-center gap-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-6 flex-1 max-w-[70%]" />
        </div>
        <div className="flex items-center gap-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-6 flex-1 max-w-[60%]" />
        </div>
        <div className="flex items-center gap-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-6 flex-1 max-w-[50%]" />
        </div>
        <div className="flex items-center gap-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-6 flex-1 max-w-[40%]" />
        </div>
      </div>
    </BoxContainer>
  );
};

export default ApexBarChartSkeleton;
