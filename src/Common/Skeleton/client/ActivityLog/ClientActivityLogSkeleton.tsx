import { Skeleton } from "@/components/ui/skeleton";
import { ProjectTableSkeleton } from "@/Common/Skeleton/Skeleton";

export default function ClientActivityLogSkeleton() {
  return (
    <div className="bg-primary-bg rounded-lg border border-border transition-colors animate-pulse w-full">
      <div className="p-6 border-b border-border flex flex-col md:flex-row md:items-center md:justify-between gap-6 w-full">
        {/* Title Skeleton */}
        <Skeleton className="h-7 w-64 shrink-0" />

        {/* Filters Row Skeleton */}
        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto justify-start md:justify-end">
          {/* Search bar skeleton */}
          <div className="w-full sm:w-[240px]">
            <Skeleton className="h-11 w-full rounded-md" />
          </div>

          {/* Filter button skeleton */}
          <Skeleton className="h-11 w-24 rounded-md shrink-0" />

          {/* Date range picker skeleton */}
          <div className="w-full sm:w-[150px] shrink-0">
            <Skeleton className="h-11 w-full rounded-md" />
          </div>

          {/* Export button skeleton */}
          <div className="w-full sm:w-[100px] shrink-0">
            <Skeleton className="h-11 w-full rounded-md" />
          </div>
        </div>
      </div>

      <ProjectTableSkeleton />
    </div>
  );
}
