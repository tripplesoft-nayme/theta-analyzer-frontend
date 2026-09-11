
import { Skeleton } from "@/components/ui/skeleton";

const PdfExportModalSkeleton = () => {
  return (
    <div className="max-w-md w-full p-6 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg shadow-2xl backdrop-blur-md flex flex-col items-center gap-6">
      {/* Header Skeleton */}
      <div className="w-full flex flex-col items-center gap-2">
        <Skeleton className="h-6 w-32 rounded-md bg-skeleton-bg" />
        <Skeleton className="h-4 w-48 rounded-md bg-skeleton-bg" />
      </div>

      {/* Conversion Graphic Card Skeleton */}
      <div className="flex items-center justify-center gap-8 py-5 px-8 bg-slate-50 dark:bg-slate-900/40 rounded-lg border border-slate-100 dark:border-slate-800/50 w-full max-w-[340px]">
        {/* Left Item */}
        <div className="flex flex-col items-center gap-2">
          <Skeleton className="h-14 w-14 rounded-md bg-skeleton-bg" />
          <Skeleton className="h-3 w-10 rounded-sm bg-skeleton-bg" />
        </div>
        {/* Arrows */}
        <div className="flex gap-1">
          <Skeleton className="h-4 w-3 rounded-full bg-skeleton-bg" />
          <Skeleton className="h-4 w-3 rounded-full bg-skeleton-bg" />
          <Skeleton className="h-4 w-3 rounded-full bg-skeleton-bg" />
        </div>
        {/* Right Item */}
        <div className="flex flex-col items-center gap-2">
          <Skeleton className="h-14 w-14 rounded-md bg-skeleton-bg" />
          <Skeleton className="h-3 w-10 rounded-sm bg-skeleton-bg" />
        </div>
      </div>

      {/* Progress text and Bar Skeleton */}
      <div className="w-full flex flex-col items-center gap-3">
        <Skeleton className="h-4 w-28 rounded-md bg-skeleton-bg" />
        <Skeleton className="h-2 w-full rounded-full bg-skeleton-bg" />
        <Skeleton className="h-3 w-16 rounded-md bg-skeleton-bg" />
      </div>
    </div>
  );
};

export default PdfExportModalSkeleton;
